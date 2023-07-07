import { Error } from "../errors/error.js";
import { AsyncFn, Fn } from "../functions/unary.js";
import { Immutable } from "../immutability/immutable.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";
import { Result } from "./result.js";

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
    map<U>(f: Fn<Immutable<T>, U>): Result<U, E>;

    /**
     * Maps the value of the Result to a new value.
     * Returns the new value wrapped in a Result.
     * The provided function must return a Promise.
     */
    asyncMap<U>(fn: AsyncFn<Immutable<T>, U>): Promise<Result<U, E>>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Result.
     */
    flatMap<U, R extends Error>(
        fn: Fn<Immutable<T>, Result<U, R>>
    ): Result<U, E | R>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Promise that resolves to a Result.
     */
    asyncFlatMap<U, R extends Error>(
        fn: AsyncFn<Immutable<T>, Result<U, R>>
    ): Promise<Result<U, E | R>>;

    fold<U>(onSuccess: Fn<Immutable<T>, U>, onFailure: Fn<E, U>): OkResult<U>;

    asyncFold<U>(
        onSuccess: AsyncFn<Immutable<T>, U>,
        onFailure: AsyncFn<E, U>
    ): Promise<OkResult<U>>;
}
