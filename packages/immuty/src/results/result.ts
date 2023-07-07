import { Error } from "../errors/index.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

/**
 * Result type for things that can fail.
 * This is a replacement for throwing exceptions
 * and it allows for type-safe error handling.
 */
export type Result<T, E extends Error | never> = [E] extends [never]
    ? OkResult<T>
    : OkResult<T> | ErrorResult<E>;

export type SomeResult = Result<any, any>;

export namespace Result {
    /**
     * Creates a Result representing the error
     */
    export function error<E extends Error>(error: E): ErrorResult<E> {
        return new ErrorResult(error);
    }
    /**
     * Creates a Result representing the value
     */
    export function ok<T>(value: T): OkResult<T> {
        return new OkResult(value);
    }
}
