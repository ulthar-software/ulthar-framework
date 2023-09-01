import { TaggedError, wrapUnexpectedError } from "../errors/index.js";
import { isTaggedError } from "../errors/is-tagged-error.js";
import { Fn, MaybePromise } from "../index.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

/**
 * Result type for things that can fail.
 * This is a replacement for throwing exceptions
 * and it allows for type-safe error handling.
 */

//export type Result<A, Ae extends TaggedError> = ErrorResult<Ae> | OkResult<A>;
export type Result<A, Ae extends TaggedError> =
    | OkResult<A>
    | ErrorResult<A, Ae>;

export type SomeResult = Result<unknown, TaggedError>;

export namespace Result {
    /**
     * Creates a Result representing the error
     */
    export function error<E extends TaggedError, A = never>(
        error: E
    ): ErrorResult<A, E> {
        return new ErrorResult(error);
    }
    /**
     * Creates a Result representing the value
     */
    export function ok<A>(value: A): OkResult<A> {
        return new OkResult(value);
    }

    //TODO: Make this wrapper so if it wraps a function that returns a Result,
    // it will flatten it out
    export function wrap<TResult, TArgs extends unknown[]>(
        fn: Fn<TArgs, MaybePromise<TResult>>
    ): Fn<
        TArgs,
        MaybePromise<
            Result<Exclude<TResult, TaggedError>, Extract<TResult, TaggedError>>
        >
    > {
        return (...args: TArgs) => {
            try {
                const result = fn(...args);
                if (result instanceof Promise) {
                    return result
                        .then((r) => {
                            if (isTaggedError(r)) {
                                return Result.error(
                                    r as Extract<TResult, TaggedError>
                                );
                            }
                            return Result.ok(
                                r as Exclude<TResult, TaggedError>
                            );
                        })
                        .catch((e) =>
                            Result.error(wrapUnexpectedError(e) as never)
                        );
                }
                if (isTaggedError(result)) {
                    return Result.error(
                        result as Extract<TResult, TaggedError>
                    );
                }
                return Result.ok(result as Exclude<TResult, TaggedError>);
            } catch (error) {
                if (isTaggedError(error)) {
                    return Result.error(error as Extract<TResult, TaggedError>);
                }
                return Result.error(wrapUnexpectedError(error) as never);
            }
        };
    }
}
