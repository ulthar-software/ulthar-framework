import {
    ErrorPatternMatcher,
    MatchedErrorsIn,
    Error,
    ErrorTag,
    TagFromError,
} from "../errors/index.js";
import { Inmutable } from "../inmutable/index.js";
import { Result } from "../results/result.js";
import { MaybePromise } from "../types/maybe-promise.js";

/**
 * An effect is a representation of a behavior that could have side effects, and that it could fail.
 *
 * It is technically a monad that can either succeed with a value T or fail with an error E.
 */
export class Effect<T, E extends Error> {
    /**
     * Creates an effect from a promise.
     * @param fn The function that returns a promise
     * @param error Function to map the error of the promise to a new value.
     * If not provided, the error will be thrown because it is not known at compile time.
     */
    static fromPromise<T>(fn: () => Promise<T>): Effect<T, never>;
    static fromPromise<T, E extends Error>(
        fn: () => Promise<T>,
        error: (error: unknown) => E
    ): Effect<T, E>;
    static fromPromise<T, E extends Error>(
        fn: () => Promise<T>,
        error?: (error: unknown) => E
    ): Effect<T, E> {
        return new Effect(async () => {
            try {
                return Result.ok(await fn());
            } catch (e) {
                if (!error) throw e;
                return Result.error(error(e));
            }
        });
    }

    private constructor(private effectFn: () => MaybePromise<Result<T, E>>) {}

    run(): MaybePromise<Result<T, E>> {
        return this.effectFn();
    }

    /**
     * Maps the effect into a new effect given a function that returns a Result.
     */
    map<U, R extends Error>(
        newEffect: (value: Inmutable<T>) => Result<U, R>
    ): Effect<U, E | R> {
        return new Effect(async () => (await this.run()).flatMap(newEffect));
    }

    /**
     * Maps the effect into a new effect given a function that returns an Effect.
     */
    flatMap<U, R extends Error>(
        effectCreator: (value: Inmutable<T>) => Effect<U, R>
    ): Effect<U, E | R> {
        return new Effect(async () => {
            const result = await this.run();
            return result.asyncFlatMap(
                async (value) => await effectCreator(value).run()
            );
        });
    }

    /**
     * Maps the effect into a new effect given a function that returns a Promise.
     */
    mapPromise<U, R extends Error>(
        newEffect: (value: Inmutable<T>) => Promise<U>,
        error: (error: unknown) => R
    ): Effect<U, E | R> {
        return new Effect(async () => {
            const result = await this.run();
            return result.asyncFlatMap(async (value) => {
                try {
                    return Result.ok<U>(await newEffect(value));
                } catch (e) {
                    return Result.error(error(e));
                }
            });
        });
    }

    /**
     * Catch the given errors of the effect and returns a new Effect that
     * cannot fail by those errors
     *
     * This allows for error recovery.
     */
    catch<const R extends Partial<ErrorPatternMatcher<E, Result<T, E>>>>(
        matcher: R
    ): Effect<T, Exclude<E, MatchedErrorsIn<R>>> {
        return new Effect(async () => {
            const result = await this.run();
            if (result.isOk()) return result;

            const error = result.unwrapError();
            const key = error[ErrorTag];
            const matcherResult: Result<T, never> = (matcher as any)[key](
                error,
                this
            );
            return matcherResult as Result<T, Exclude<E, MatchedErrorsIn<R>>>;
        });
    }

    retry(opts?: RetryOptions<E>): Effect<T, E> {
        const { errors, maxTimes: max = 1 } = opts ?? {};
        return new Effect(async () => {
            let retries = 0;
            while (true) {
                const result = await this.run();
                if (result.isOk()) return result;

                const error = result.unwrapError();
                if (retries >= max) return result;
                if (errors && !errors.includes(error[ErrorTag])) return result;

                retries++;
            }
        });
    }

    orDie(): Effect<T, never> {
        return new Effect(async () => {
            const result = await this.run();
            if (result.isOk()) return result;
            throw result.unwrapError();
        });
    }
}

interface RetryOptions<E extends Error> {
    readonly errors?: ReadonlyArray<TagFromError<E>>;
    readonly maxTimes?: number;
}
