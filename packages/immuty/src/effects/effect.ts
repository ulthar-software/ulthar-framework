import {
    ArrayType,
    Fn,
    RemainingUnmatchedErrors,
    Result,
    TaggedError,
    TimeSpan,
    liftFn,
} from "../index.js";
import { MergeTypes } from "../types/merge-types.js";
import { composeEffects } from "./compose-effects.js";
import { effectFromPromise } from "./effect-from-promise.js";
import { EffectConstructor, EffectFn, PipeableEffectFn } from "./effect-fn.js";
import { pipeEffects } from "./pipe-effects.js";
import {
    FullEffectErrorPatternMatcher,
    PartialEffectErrorPatternMatcher,
    effectErrorFullMatch,
    effectErrorPartialMatch,
} from "./effect-error-matchers.js";
import { Schedule } from "../time/schedule.js";
import { RetryOpts, composeEffectWithRetry } from "./effect-retry.js";
import { MaybePromise } from "../types/maybe-promise.js";
import { EffectStream } from "./effect-stream.js";
import { Resource } from "../resources/resource.js";
import { ErrorWrapper } from "../errors/error-wrapper.js";

/**
 * An effect is a representation of a (most-likely-asynchronous) behavior that executes
 * within a certain environment of type `Deps` (or `void`), outputs a value of type `A` or `void` and could fail
 * with a certain union of errors of type `Err` or `never` (which doesn't mean could never fail, but it could never fail
 * for a **known** reason).
 *
 * Creating an effect does not execute it. To execute an effect, you need to call its `run` method
 * providing the dependencies object of type `Deps` (or nothing if the effect has a dependency of void).
 *
 * Effects are composable, meaning that you can combine two effects into a single effect
 * that first runs one effect and then pipes its result into the other effect.
 *
 * Effects can be scheduled, delayed, cancelled, retried, or run in parallel.
 */
export class Effect<ADeps = void, A = void, AErr extends TaggedError = never> {
    private constructor(private readonly f: EffectFn<ADeps, A, AErr>) {}

    /**
     * Creates a new effect from a function that returns a promise.
     */
    static fromPromise<
        ADeps = void,
        A = void,
        AErr extends TaggedError = never,
    >(
        f: Fn<ADeps, Promise<A>>,
        e?: ErrorWrapper<AErr>
    ): Effect<ADeps, A, AErr> {
        return new Effect(effectFromPromise(f, e));
    }

    static from<ADeps = void, A = void, AErr extends TaggedError = never>(
        f: EffectFn<ADeps, A, AErr>
    ): Effect<ADeps, A, AErr> {
        return new Effect(f);
    }

    /**
     * Creates a new effect from a function that returns a value.
     */
    static fromSync<ADeps = void, A = void, AErr extends TaggedError = never>(
        f: Fn<ADeps, A>,
        e?: ErrorWrapper<AErr>
    ): Effect<ADeps, A, AErr> {
        return new Effect(
            effectFromPromise((deps) => Promise.resolve(f(deps)), e)
        ) as Effect<ADeps, A, AErr>;
    }

    static fromSyncResult<
        ADeps = void,
        A = void,
        AErr extends TaggedError = never,
    >(f: Fn<ADeps, Result<A, AErr>>): Effect<ADeps, A, AErr> {
        return new Effect((deps) => Promise.resolve(f(deps)));
    }

    /**
     * Creates a new effect that first runs this effect and then pipes its result into the given effect.
     * @param g The effect to pipe the result of this effect into. It must return a Result type.
     */
    map<BDeps, B, BErr extends TaggedError>(
        g: PipeableEffectFn<BDeps, A, B, BErr>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(composeEffects(this.f, g));
    }

    /**
     * Creates a new effect that first runs this effect and then pipes its result into the given function.
     * The given function gets lifted to return a Result type.
     *
     * @param g The function for the new effect, it must return a promise.
     * @param e The error wrapper to handle any errors in the promise. If not provided, the effect
     * infers that it cannot fail for a known reason. In that case, if the promise rejects, the effect
     * will fail with the default UnexpectedError.
     */
    mapPromise<B, BDeps = void, BErr extends TaggedError = never>(
        g: Fn<[A, BDeps], Promise<B>>,
        e?: ErrorWrapper<BErr>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(composeEffects(this.f, liftFn(g, e)));
    }

    mapSync<B, BDeps = void, BErr extends TaggedError = never>(
        g: Fn<[A, BDeps], B>,
        e?: ErrorWrapper<BErr>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(
            composeEffects(
                this.f,
                liftFn((x) => Promise.resolve(g(x)), e)
            )
        );
    }

    /**
     * Creates a new effect that first runs this effect and then pipes its result into the given effect.
     * @param g The effect constructor to call that must return an Effect.
     */
    flatMap<BDeps, B, BErr extends TaggedError>(
        g: EffectConstructor<A, B, BDeps, BErr>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(pipeEffects(this.f, g));
    }

    /**
     * Creates a new effect that executes with the result of this effect,
     * but doesn't change the result of this effect.
     *
     * This is useful for side-effects that don't change the result of the effect, like logging.
     */
    tap(f: Fn<A, MaybePromise<void>>): Effect<ADeps, A, AErr> {
        return new Effect(async (deps) => {
            const result = await this.f(deps);
            if (result.isOk()) {
                try {
                    await f(result.unwrap());
                } catch {
                    // ignore
                }
            }
            return result;
        });
    }

    tapError(f: Fn<AErr, MaybePromise<void>>): Effect<ADeps, A, AErr> {
        return new Effect(async (deps) => {
            const result = await this.f(deps);
            if (result.isError()) {
                try {
                    await f(result.unwrapError());
                } catch {
                    // ignore
                }
            }
            return result;
        });
    }

    tapResult(
        f: Fn<Result<A, AErr>, MaybePromise<void>>
    ): Effect<ADeps, A, AErr> {
        return new Effect(async (deps) => {
            const result = await this.f(deps);
            try {
                await f(result);
            } catch {
                // ignore
            }
            return result;
        });
    }

    /**
     * Creates a new effect that catches some of the errors described by `AErr` and maps them to the corresponding
     * value of type `A`
     * The new effect will infer the type of the remaining errors that are not matched by the matcher.
     */
    catchSome<PM extends PartialEffectErrorPatternMatcher<ADeps, AErr, A>>(
        matcher: PM
    ): Effect<ADeps, A, RemainingUnmatchedErrors<AErr, PM>> {
        return new Effect(async (deps) => {
            const result = await this.f(deps);
            return effectErrorPartialMatch(deps, result, matcher);
        });
    }

    /**
     * Creates a new effect that catches all of the errors described by `AErr` and maps them to the corresponding
     * value of type `A`
     * The new effect will have no errors (i.e. `never`) because all of the errors are matched.
     * Be aware that this does not mean that the effect will never fail, it just means that it will never fail
     * for a **known** reason.
     */
    catchAll(
        matcher: FullEffectErrorPatternMatcher<ADeps, AErr, A>
    ): Effect<ADeps, A> {
        return new Effect(async (deps) => {
            const result = await this.f(deps);
            return effectErrorFullMatch(deps, result, matcher);
        });
    }

    /**
     * Creates a new effect that will retry this effect according to the given schedule.
     * This new effect will execute one more time than what the schedule specifies.
     *
     * If the opts.onlyOn is specified, the effect will only retry if the error matches the given
     * list of tags
     */
    retry(schedule: Schedule, opts?: RetryOpts<AErr>): Effect<ADeps, A, AErr> {
        return new Effect(composeEffectWithRetry(this.f, schedule, opts));
    }

    /**
     * Creates a new effect that throws if the result of this effect is an error.
     * This is the only way an effect can throw.
     * This is used to halt the program for unrecoverable errors.
     */
    orDie(): Effect<ADeps, A> {
        return new Effect(async (deps) => {
            const result = await this.f(deps);
            if (result.isOk()) {
                return result;
            } else {
                throw result.unwrapError().nativeError;
            }
        });
    }

    static withResource<
        ResourceType,
        ResultType = void,
        ResAcqDepType = void,
        EffectDepType = void,
        ResAcqErrType extends TaggedError = never,
        EffectErrType extends TaggedError = never,
    >(
        resource: Resource<ResourceType, ResAcqDepType, ResAcqErrType>,
        effectFn: EffectConstructor<
            ResourceType,
            ResultType,
            EffectDepType,
            EffectErrType
        >
    ): Effect<
        MergeTypes<ResAcqDepType, EffectDepType>,
        ResultType,
        ResAcqErrType | EffectErrType
    > {
        return new Effect(async (deps) => {
            return await resource.useWith(deps, effectFn);
        });
    }

    spread(): EffectStream<ArrayType<A>, AErr, ADeps, ArrayType<A>, AErr> {
        return EffectStream.fromListEffect(
            this.f as EffectFn<ADeps, ArrayType<A>[], AErr>
        );
    }

    /**
     * Asynchronously executes the effect.
     */
    run(deps: ADeps): Promise<Result<A, AErr>> {
        return this.f(deps);
    }

    async delayedRun(delay: TimeSpan, deps: ADeps): Promise<Result<A, AErr>> {
        await delay.sleep();
        return this.f(deps);
    }

    schedule(schedule: Schedule): EffectStream<void, never, ADeps, A, AErr> {
        return EffectStream.fromSchedule(this.f, schedule);
    }
}
