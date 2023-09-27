import { TaggedError } from "../errors/tagged-error.js";
import {
    ErrorPatternMatcher,
    RemainingUnmatchedErrors,
    PartialErrorPatternMatcher,
    fullMatch,
    partialMatch,
} from "../index.js";
import { IResult, ResultFoldParams } from "./result-interface.js";
import { Result } from "./result.js";

/**
 * Represents a Result failure.
 */
export class ErrorResult<A, AErr extends TaggedError>
    implements IResult<A, AErr>
{
    constructor(private readonly error: AErr) {}

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
    isError(): this is ErrorResult<A, AErr> {
        return true;
    }

    /**
     * Unwraps the error contained in this Result.
     */
    unwrapError(): AErr {
        return this.error;
    }

    /**
     * Maps the value of the Result into a new value.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    map(): Result<never, AErr> {
        return this as unknown as Result<never, AErr>;
    }

    /**
     * Maps the value of the Result into a new value.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    asyncMap(): Promise<Result<never, AErr>> {
        return Promise.resolve(this as unknown as Result<never, AErr>);
    }

    /**
     * Maps the value of the Result into a new Result.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    flatMap<B, Be extends TaggedError>(): Result<B, AErr | Be> {
        return this as unknown as Result<B, AErr | Be>;
    }

    /**
     * Maps the value of the Result into a new Result.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    asyncFlatMap<B, Be extends TaggedError>(): Promise<Result<B, AErr | Be>> {
        return Promise.resolve(this as unknown as Result<never, AErr | Be>);
    }

    /**
     * Folds the Result into a new Result.
     * This lets you handle both the success and failure cases.
     * As this is an ErrorResult, the onFailure function is called
     * and the result of that function is returned.
     */
    fold<B>({ onFailure }: ResultFoldParams<never, B, AErr>): Result<B, never> {
        return Result.ok(onFailure(this.error));
    }

    /**
     * Folds the Result into a new Result.
     * This lets you handle both the success and failure cases.
     * As this is an ErrorResult, the onFailure function is called
     * and the result of that function is returned.
     */
    async asyncFold<B>({
        onFailure,
    }: ResultFoldParams<never, Promise<B>, AErr>): Promise<Result<B, never>> {
        return Result.ok(await onFailure(this.error));
    }

    catchSome<PM extends PartialErrorPatternMatcher<AErr, A, Result<A, never>>>(
        matcher: PM
    ): Result<A, RemainingUnmatchedErrors<AErr, PM>> {
        const x = partialMatch(this.error, matcher);
        if (x) {
            return x as unknown as Result<
                A,
                RemainingUnmatchedErrors<AErr, PM>
            >;
        } else {
            return this as unknown as Result<
                A,
                RemainingUnmatchedErrors<AErr, PM>
            >;
        }
    }

    catchAll(
        matcher: ErrorPatternMatcher<AErr, A, Result<A, never>>
    ): Result<A, never> {
        return fullMatch(this.error, matcher);
    }
}
