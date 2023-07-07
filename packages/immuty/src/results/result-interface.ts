import { Error } from "../errors/error.js";
import { AsyncFn, Fn } from "../functions/unary.js";
import { Immutable } from "../immutability/immutable.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";
import { Result } from "./result.js";

/**
 * Interface for the Result type common signature.
 */
export interface IResult<A, Ae extends Error> {
    /**
     * True if the Result is a success.
     */
    isOk(): this is OkResult<A>;

    /**
     * True if the Result is a failure.
     */
    isError(): this is ErrorResult<Ae>;

    /**
     * Maps the value of the Result to a new value.
     * The provided function must return a value
     * and the returned value will be wrapped in a Result.
     *
     * @param onSuccess Function to map the value of the Result to a new value.
     * @param onFailure Function to map the error of the Result to a new value.
     */
    map<B>(f: Fn<Immutable<A>, B>): Result<B, Ae>;

    /**
     * Maps the value of the Result to a new value.
     * Returns the new value wrapped in a Result.
     * The provided function must return a Promise.
     */
    asyncMap<B>(f: AsyncFn<Immutable<A>, B>): Promise<Result<B, Ae>>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Result.
     */
    flatMap<B, Be extends Error>(
        f: Fn<Immutable<A>, Result<B, Be>>
    ): Result<B, Ae | Be>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Promise that resolves to a Result.
     */
    asyncFlatMap<B, Be extends Error>(
        f: AsyncFn<Immutable<A>, Result<B, Be>>
    ): Promise<Result<B, Ae | Be>>;

    /**
     * Fold the Result into a new value.
     * This lets you handle both the success and failure cases.
     * The provided functions must return a value
     * and the returned value will be wrapped in a Result.
     */
    fold<B>(params: ResultFoldParams<A, B, Ae>): OkResult<B>;

    /**
     * Fold the Result into a new value.
     * This lets you handle both the success and failure cases.
     * The provided functions must return a Promise that resolves to a value
     * and the returned value will be wrapped in a Result.
     */
    asyncFold<B>(
        params: ResultFoldParams<A, Promise<B>, Ae>
    ): Promise<OkResult<B>>;
}

export interface ResultFoldParams<A, B, Ae extends Error> {
    onSuccess: Fn<Immutable<A>, B>;
    onFailure: Fn<Ae, B>;
}
