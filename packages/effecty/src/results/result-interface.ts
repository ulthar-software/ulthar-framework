import {
    ErrorPatternMatcher,
    PartialErrorPatternMatcher,
    RemainingUnmatchedErrors,
} from "../errors/error-pattern-matcher.js";
import { TaggedError } from "../errors/tagged-error.js";
import { Result } from "./result.js";
import { Fn } from "../utils/functions/function.js";
import { Immutable } from "../utils/immutability/immutable.js";
import { AsyncResult } from "./async-result.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

export interface IResult<TValue, TError extends TaggedError> {
    isOk(): this is OkResult<TValue, TError>;
    isError(): this is ErrorResult<TValue, TError>;

    map<TMappedValue>(
        f: Fn<[Immutable<TValue>], TMappedValue>
    ): Result<TMappedValue, TError>;

    asyncMap<TMappedValue>(
        f: Fn<[Immutable<TValue>], Promise<TMappedValue>>
    ): AsyncResult<TMappedValue, TError>;

    flatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[Immutable<TValue>], Result<TMappedValue, TOtherError>>
    ): Result<TMappedValue, TError | TOtherError>;

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[Immutable<TValue>], Promise<Result<TMappedValue, TOtherError>>>
    ): AsyncResult<TMappedValue, TError | TOtherError>;

    asyncResultMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[Immutable<TValue>], AsyncResult<TMappedValue, TOtherError>>
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
