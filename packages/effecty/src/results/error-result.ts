import {
    ErrorPatternMatcher,
    PartialErrorPatternMatcher,
    RemainingUnmatchedErrors,
} from "../errors/error-pattern-matcher.js";
import { TaggedError } from "../errors/tagged-error.js";
import { Result } from "./result.js";
import { Fn } from "../utils/functions/function.js";
import { Immutable } from "../utils/immutability/immutable.js";
import { fullMatch, partialMatch } from "../variants/match.js";
import { AsyncResult } from "./async-result.js";
import { OkResult } from "./ok-result.js";
import { IResult } from "./result-interface.js";

export class ErrorResult<TValue, TError extends TaggedError>
    implements IResult<TValue, TError>
{
    constructor(private readonly error: TError) {}

    isOk(): this is OkResult<TValue, TError> {
        return false;
    }

    isError(): this is ErrorResult<TValue, TError> {
        return true;
    }

    unwrapError(): TError {
        return this.error;
    }

    map(): Result<never, TError> {
        return this as unknown as Result<never, TError>;
    }

    asyncMap<TMappedValue>(
        _mapFn: Fn<[Immutable<TValue>], Promise<TMappedValue>>
    ): AsyncResult<TMappedValue, TError> {
        return new AsyncResult(
            Promise.resolve(this as unknown as Result<TMappedValue, TError>)
        );
    }

    flatMap<TMappedValue, TOtherError extends TaggedError>(): Result<
        TMappedValue,
        TError | TOtherError
    > {
        return this as unknown as Result<TMappedValue, TError | TOtherError>;
    }

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(): AsyncResult<
        TMappedValue,
        TError | TOtherError
    > {
        return new AsyncResult(
            Promise.resolve(this as unknown as Result<TMappedValue, TError>)
        );
    }

    asyncResultMap<
        TMappedValue,
        TOtherError extends TaggedError<string>,
    >(): AsyncResult<TMappedValue, TError | TOtherError> {
        return new AsyncResult(
            Promise.resolve(this as unknown as Result<TMappedValue, TError>)
        );
    }

    catchSome<
        PM extends PartialErrorPatternMatcher<
            TError,
            TValue,
            Result<TValue, never>
        >,
    >(matcher: PM): Result<TValue, RemainingUnmatchedErrors<TError, PM>> {
        const x = partialMatch(this.error, matcher);
        if (x) {
            return x as unknown as Result<
                TValue,
                RemainingUnmatchedErrors<TError, PM>
            >;
        } else {
            return this as unknown as Result<
                TValue,
                RemainingUnmatchedErrors<TError, PM>
            >;
        }
    }

    catchAll(
        matcher: ErrorPatternMatcher<TError, TValue, Result<TValue, never>>
    ): Result<TValue, never> {
        return fullMatch(this.error, matcher);
    }
}
