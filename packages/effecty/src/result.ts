import { TaggedError } from "./errors/tagged-error.js";
import { ErrorResult } from "./results/error-result.js";
import { OkResult } from "./results/ok-result.js";

export { resultify } from "./results/resultify.js";
export { AsyncResult } from "./results/async-result.js";

/**
 * Result type for things that can fail.
 * This is a replacement for throwing exceptions
 * and it allows for type-safe error handling.
 */
export type Result<TValue, TError extends TaggedError> =
    | OkResult<TValue, TError>
    | ErrorResult<TValue, TError>;

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
