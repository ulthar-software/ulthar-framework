import { TaggedError } from "../errors/tagged-error.js";
import { AsyncResult } from "./async-result.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

/**
 * Result type for things that can fail.
 * This is a replacement for throwing exceptions
 * and it allows for type-safe error handling.
 */
export type Result<TValue, TError extends TaggedError> =
    | OkResult<TValue, TError>
    | ErrorResult<TValue, TError>;

export type MaybeAsyncResult<TValue, TError extends TaggedError> =
    | AsyncResult<TValue, TError>
    | Result<TValue, TError>;

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
}
