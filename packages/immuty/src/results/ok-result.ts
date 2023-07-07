import { Error } from "../errors/error.js";
import { Immutable } from "../immutability/immutable.js";
import { IResult } from "./result-interface.js";
import { Result } from "./result.js";

/**
 * Represents a Successful Result.
 */
export class OkResult<T> implements IResult<T, never> {
    constructor(private readonly value: T) {}

    /**
     * Determine if this Result is a success.
     * Always returns true
     */
    isOk(): this is OkResult<T> {
        return true;
    }

    /**
     * Determine if this Result is an error.
     * Always returns false
     */
    isError(): this is never {
        return false;
    }

    /**
     * Unwraps the value of the Result.
     */
    unwrap(): Immutable<T> {
        return this.value as Immutable<T>;
    }

    /**
     * Maps the value of the Result into a new value.
     * The mapping function must return a value and that
     * value will be wrapped in a new Result.
     */
    map<U>(fn: (value: Immutable<T>) => U): OkResult<U> {
        return Result.ok(fn(this.value as Immutable<T>));
    }

    /**
     * Maps the value of the Result into a new value.
     * The mapping function must return a Promise of a value
     */
    async asyncMap<U>(
        fn: (value: Immutable<T>) => Promise<U>
    ): Promise<Result<U, never>> {
        return Result.ok(await fn(this.value as Immutable<T>));
    }

    /**
     * Maps the value of the Result into a new Result.
     * The mapping function must return a Result.
     */
    flatMap<U, R extends Error>(
        fn: (value: Immutable<T>) => Result<U, R>
    ): Result<U, R> {
        return fn(this.value as Immutable<T>);
    }

    /**
     * Maps the value of the Result into a new Result.
     * The mapping function must return a Promise of a Result.
     */
    async asyncFlatMap<U, R extends Error>(
        fn: (value: Immutable<T>) => Promise<Result<U, R>>
    ): Promise<Result<U, R>> {
        return fn(this.value as Immutable<T>);
    }

    fold<U>(onSuccess: (value: Immutable<T>) => U): OkResult<U> {
        return Result.ok(onSuccess(this.unwrap()));
    }

    async asyncFold<U>(
        onSuccess: (value: Immutable<T>) => Promise<U>
    ): Promise<OkResult<U>> {
        return Result.ok(await onSuccess(this.unwrap()));
    }
}
