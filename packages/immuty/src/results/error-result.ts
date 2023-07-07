import { Error } from "../errors/error.js";
import { Immutable } from "../immutability/immutable.js";
import { OkResult } from "./ok-result.js";
import { IResult } from "./result-interface.js";
import { Result } from "./result.js";

/**
 * Represents a Result failure.
 */
export class ErrorResult<E extends Error> implements IResult<never, E> {
    constructor(private readonly error: E) {}

    /**
     * Determine if this Result is a success.
     * Always returns false
     */
    isOk(): this is never {
        return false;
    }

    /**
     * Determine if this Result is a failure.
     * Always returns true
     */
    isError(): this is ErrorResult<E> {
        return true;
    }

    /**
     * Unwraps the error contained in this Result.
     */
    unwrapError(): Immutable<E> {
        return this.error as Immutable<E>;
    }

    /**
     * Maps the value of the Result into a new value.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    map<U>(fn: (value: never) => U): Result<U, E> {
        return this as unknown as Result<U, E>;
    }

    /**
     * Maps the value of the Result into a new value.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    async asyncMap<U>(): Promise<Result<U, E>> {
        return this as unknown as Result<U, E>;
    }

    /**
     * Maps the value of the Result into a new Result.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    flatMap<U, R extends Error>(): Result<U, E | R> {
        return this as unknown as Result<U, E>;
    }

    /**
     * Maps the value of the Result into a new Result.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    async asyncFlatMap<U, R extends Error>(): Promise<Result<U, E | R>> {
        return this as unknown as Result<U, E>;
    }

    fold<U>(
        onSuccess: (value: never) => U,
        onFailure: (error: E) => U
    ): OkResult<U> {
        return Result.ok(onFailure(this.error));
    }

    async asyncFold<U>(
        onSuccess: (value: never) => Promise<U>,
        onFailure: (error: E) => Promise<U>
    ): Promise<OkResult<U>> {
        return Result.ok(await onFailure(this.error));
    }
}
