import { TaggedError, wrapUnexpectedError } from "../errors/index.js";
import { isTaggedError } from "../errors/is-tagged-error.js";
import { Fn, MaybePromise } from "../index.js";
import { ErrorResult } from "./error-result.js";
import { isResult } from "./is-result.js";
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
    export function ok<A, AErr extends TaggedError = never>(
        value: A
    ): OkResult<A, AErr> {
        return new OkResult(value);
    }

    export function wrap<
        TResult extends MaybePromise<unknown>,
        TArgs extends unknown[],
        WrappedResult = Result<
            Exclude<Awaited<TResult>, TaggedError>,
            Extract<Awaited<TResult>, TaggedError>
        >,
    >(
        fn: Fn<TArgs, TResult>
    ): Fn<TArgs, DetectedPromise<TResult, WrappedResult>> {
        return (...args: TArgs) => {
            try {
                const result = fn(...args);
                if (isResult(result)) {
                    return result as DetectedPromise<TResult, WrappedResult>;
                }
                if (result instanceof Promise) {
                    return result
                        .then((r) => {
                            if (isResult(r)) {
                                return r;
                            }
                            if (isTaggedError(r)) {
                                return Result.error(r);
                            }
                            return Result.ok(r);
                        })
                        .catch((e) =>
                            Result.error(wrapUnexpectedError(e) as never)
                        ) as DetectedPromise<TResult, WrappedResult>;
                }
                if (isTaggedError(result)) {
                    return Result.error(result) as DetectedPromise<
                        TResult,
                        WrappedResult
                    >;
                }
                return Result.ok(result) as DetectedPromise<
                    TResult,
                    WrappedResult
                >;
            } catch (error) {
                return Result.error(
                    wrapUnexpectedError(error) as never
                ) as DetectedPromise<TResult, WrappedResult>;
            }
        };
    }
}

type DetectedPromise<MaybePromise, T> = MaybePromise extends Promise<unknown>
    ? Promise<T>
    : T;
