import { Fn, Result, TaggedError } from "../index.js";
import { MergeTypes } from "../types/merge-types.js";
import { composeEffects } from "./compose-effects.js";
import { effectFromPromise } from "./effect-from-promise.js";
import { EffectConstructor, EffectFn, PipeableEffectFn } from "./effect-fn.js";
import { ErrorWrapper } from "../errors/create-native-error-wrapper.js";
import { pipeEffects } from "./pipe-effects.js";

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
        AErr extends TaggedError = never
    >(
        f: Fn<ADeps, Promise<A>>,
        e?: ErrorWrapper<AErr>
    ): Effect<ADeps, A, AErr> {
        return new Effect(effectFromPromise(f, e));
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
        );
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
     * Creates a new effect that first runs this effect and then pipes its result into the given effect.
     * @param g The effect constructor to call that must return an Effect.
     */
    flatMap<BDeps, B, BErr extends TaggedError>(
        g: EffectConstructor<A, B, BDeps, BErr>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(pipeEffects(this.f, g));
    }

    /**
     * Asynchronously executes the effect.
     */
    run(deps: ADeps): Promise<Result<A, AErr>> {
        return this.f(deps);
    }
}
