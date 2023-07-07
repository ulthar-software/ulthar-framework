import { TaggedError } from "../errors/index.js";
import { BinaryFn } from "../functions/binary.js";
import { SomeFunction } from "../functions/function.js";
import { Fn } from "../functions/unary.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

//prettier-ignore
/**
 * Result type for things that can fail.
 * This is a replacement for throwing exceptions
 * and it allows for type-safe error handling.
 */
export type Result<A, Ae extends TaggedError | never> = 
    [Ae] extends [never] ? OkResult<A> : 
    [A] extends [never] ? ErrorResult<Ae> :
    OkResult<A> | ErrorResult<Ae>;

export type SomeResult = Result<any, any>;

export namespace Result {
    /**
     * Creates a Result representing the error
     */
    export function error<E extends TaggedError>(error: E): ErrorResult<E> {
        return new ErrorResult(error);
    }
    /**
     * Creates a Result representing the value
     */
    export function ok<A>(value: A): OkResult<A> {
        return new OkResult(value);
    }
}

export function liftReliableAsyncFn<A, B>(
    fn: Fn<A, Promise<B>>
): Fn<A, Promise<Result<B, never>>> {
    return async (x: A) => {
        const result = await fn(x);
        return Result.ok(result);
    };
}

export function liftFaultyAsyncFn<A, B, AErr extends TaggedError = never>(
    f: Fn<A, Promise<B>>,
    onFailure?: Fn<unknown, AErr>
): Fn<A, Promise<Result<B, AErr>>> {
    return async (x: A) => {
        try {
            return (await liftReliableAsyncFn(f)(x)) as Result<B, AErr>;
        } catch (error) {
            if (onFailure) {
                return Result.error(onFailure(error)) as Result<B, AErr>;
            }
            throw error;
        }
    };
}

export function liftReliableAsyncBinaryFn<A, B, C>(
    fn: BinaryFn<A, B, Promise<C>>
): BinaryFn<A, B, Promise<Result<C, never>>> {
    return async (x: A, y: B) => {
        const result = await fn(x, y);
        return Result.ok(result);
    };
}

export function liftFaultyAsyncBinaryFn<
    A,
    B,
    C,
    AErr extends TaggedError = never
>(
    f: BinaryFn<A, B, Promise<C>>,
    onFailure?: Fn<unknown, AErr>
): BinaryFn<A, B, Promise<Result<C, AErr>>> {
    return async (x: A, y: B) => {
        try {
            return (await liftReliableAsyncBinaryFn(f)(x, y)) as Result<
                C,
                AErr
            >;
        } catch (error) {
            if (onFailure) {
                return Result.error(onFailure(error)) as Result<C, AErr>;
            }
            throw error;
        }
    };
}
