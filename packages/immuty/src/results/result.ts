import { TaggedError } from "../errors/index.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

//prettier-ignore
/**
 * Result type for things that can fail.
 * This is a replacement for throwing exceptions
 * and it allows for type-safe error handling.
 */

//export type Result<A, Ae extends TaggedError> = ErrorResult<Ae> | OkResult<A>;
export type Result<A, Ae extends TaggedError> = 
    [Ae] extends [never] ? OkResult<A> : 
    [A] extends [never] ? ErrorResult<A,Ae> :
    OkResult<A> | ErrorResult<A,Ae>;

export type SomeResult = Result<any, any>;

export namespace Result {
    /**
     * Creates a Result representing the error
     */
    export function error<E extends TaggedError>(
        error: E
    ): ErrorResult<never, E> {
        return new ErrorResult(error);
    }
    /**
     * Creates a Result representing the value
     */
    export function ok<A>(value: A): OkResult<A> {
        return new OkResult(value);
    }
}
