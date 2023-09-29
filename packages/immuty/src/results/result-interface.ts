import {
    Fn,
    ErrorPatternMatcher,
    PartialErrorPatternMatcher,
    RemainingUnmatchedErrors,
    TaggedError,
    Result,
} from "../index.js";
import { AsyncResult } from "./async-result.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

export interface IResult<TValue, TError extends TaggedError> {
    isOk(): this is OkResult<TValue, TError>;
    isError(): this is ErrorResult<TValue, TError>;

    map<TMappedValue>(
        f: Fn<[TValue], TMappedValue>
    ): Result<TMappedValue, TError>;

    asyncMap<TMappedValue>(
        f: Fn<[TValue], Promise<TMappedValue>>
    ): AsyncResult<TMappedValue, TError>;

    flatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[TValue], Result<TMappedValue, TOtherError>>
    ): Result<TMappedValue, TError | TOtherError>;

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[TValue], Promise<Result<TMappedValue, TOtherError>>>
    ): AsyncResult<TMappedValue, TError | TOtherError>;

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
