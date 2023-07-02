import { Error } from "../errors/index.js";
import { Immutable } from "../immutable/index.js";

/**
 * Interface for the Result type common signature.
 */
export interface IResult<T, E extends Error> {
    /**
     * True if the Result is a success.
     */
    isOk(): this is OkResult<T>;

    /**
     * True if the Result is a failure.
     */
    isError(): this is ErrorResult<E>;

    /**
     * Maps the value of the Result to a new value.
     * The provided function must return a value
     * and the returned value will be wrapped in a Result.
     *
     * @param onSuccess Function to map the value of the Result to a new value.
     * @param onFailure Function to map the error of the Result to a new value.
     */
    map<U>(fn: (value: Immutable<T>) => U): Result<U, E>;

    /**
     * Maps the value of the Result to a new value.
     * Returns the new value wrapped in a Result.
     * The provided function must return a Promise.
     */
    asyncMap<U>(fn: (value: Immutable<T>) => Promise<U>): Promise<Result<U, E>>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Result.
     */
    flatMap<U, R extends Error>(
        fn: (value: Immutable<T>) => Result<U, R>
    ): Result<U, E | R>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Promise that resolves to a Result.
     */
    asyncFlatMap<U, R extends Error>(
        fn: (value: Immutable<T>) => Promise<Result<U, R>>
    ): Promise<Result<U, E | R>>;
}

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
}

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
}
