import { TaggedError } from "../errors/tagged-error.js";
import { Fn } from "../functions/unary.js";
import {
    ErrorPatternMatcher,
    RemainingUnmatchedErrors,
    PartialErrorPatternMatcher,
} from "../index.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";
import { Result } from "./result.js";

/**
 * Interface for the Result type common signature.
 */
export interface IResult<TValue, TError extends TaggedError> {
    /**
     * True if the Result is a success.
     */
    isOk(): this is OkResult<TValue, TError>;

    /**
     * True if the Result is a failure.
     */
    isError(): this is ErrorResult<TValue, TError>;

    /**
     * Maps the value of the Result to a new value.
     * The provided function must return a value
     * and the returned value will be wrapped in a Result.
     *
     * @param onSuccess Function to map the value of the Result to a new value.
     * @param onFailure Function to map the error of the Result to a new value.
     */
    map<TMappedValue>(
        f: Fn<[TValue], TMappedValue>
    ): Result<TMappedValue, TError>;

    /**
     * Maps the value of the Result to a new value.
     * Returns the new value wrapped in a Result.
     * The provided function must return a Promise.
     */
    asyncMap<TMappedValue>(
        f: Fn<[TValue], Promise<TMappedValue>>
    ): Promise<Result<TMappedValue, TError>>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Result.
     */
    flatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[TValue], Result<TMappedValue, TOtherError>>
    ): Result<TMappedValue, TError | TOtherError>;

    /**
     * Maps the value of the Result to a new Result.
     * The provided function must return a Promise that resolves to a Result.
     */
    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[TValue], Promise<Result<TMappedValue, TOtherError>>>
    ): Promise<Result<TMappedValue, TError | TOtherError>>;

    /**
     * Fold the Result into a new value.
     * This lets you handle both the success and failure cases.
     * The provided functions must return a value
     * and the returned value will be wrapped in a Result.
     */
    fold<TMappedValue>(
        params: ResultFoldParams<TValue, TMappedValue, TError>
    ): Result<TMappedValue, never>;

    /**
     * Fold the Result into a new value.
     * This lets you handle both the success and failure cases.
     * The provided functions must return a Promise that resolves to a value
     * and the returned value will be wrapped in a Result.
     */
    asyncFold<TMappedValue>(
        params: ResultFoldParams<TValue, Promise<TMappedValue>, TError>
    ): Promise<Result<TMappedValue, never>>;

    /**
     * Catches some of the errors of the Result and returns a new Result that
     * contains the remaining non catched errors;
     *
     */
    catchSome<
        PM extends PartialErrorPatternMatcher<
            TError,
            TValue,
            Result<TValue, never>
        >,
    >(
        matcher: PM
    ): Result<TValue, RemainingUnmatchedErrors<TError, PM>>;

    catchAll(
        matcher: ErrorPatternMatcher<TError, TValue, Result<TValue, never>>
    ): Result<TValue, never>;
}

export interface ResultFoldParams<A, B, Ae extends TaggedError> {
    onSuccess: Fn<[A], B>;
    onFailure: Fn<[Ae], B>;
}
