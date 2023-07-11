import { TaggedError } from "../errors/tagged-error.js";
import { Immutable } from "../immutability/immutable.js";
import { OkResult } from "./ok-result.js";
import { IResult, ResultFoldParams } from "./result-interface.js";
import { Result } from "./result.js";

/**
 * Represents a Result failure.
 */
export class ErrorResult<Ae extends TaggedError> implements IResult<never, Ae> {
    constructor(private readonly error: Ae) {}

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
    isError(): this is ErrorResult<Ae> {
        return true;
    }

    /**
     * Unwraps the error contained in this Result.
     */
    unwrapError(): Immutable<Ae> {
        return this.error as Immutable<Ae>;
    }

    /**
     * Maps the value of the Result into a new value.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    map(): Result<never, Ae> {
        return this as unknown as Result<never, Ae>;
    }

    /**
     * Maps the value of the Result into a new value.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    async asyncMap(): Promise<Result<never, Ae>> {
        return this as unknown as Result<never, Ae>;
    }

    /**
     * Maps the value of the Result into a new Result.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    flatMap<B, Be extends TaggedError>(): Result<B, Ae | Be> {
        return this as unknown as Result<B, Ae>;
    }

    /**
     * Maps the value of the Result into a new Result.
     * As this is an ErrorResult, the mapping function is not called
     * and the same ErrorResult is returned.
     */
    async asyncFlatMap<B, Be extends TaggedError>(): Promise<
        Result<B, Ae | Be>
    > {
        return this as unknown as Result<B, Ae>;
    }

    /**
     * Folds the Result into a new Result.
     * This lets you handle both the success and failure cases.
     * As this is an ErrorResult, the onFailure function is called
     * and the result of that function is returned.
     */
    fold<A>({ onFailure }: ResultFoldParams<never, A, Ae>): OkResult<A> {
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
    }: ResultFoldParams<never, Promise<B>, Ae>): Promise<OkResult<B>> {
        return Result.ok(await onFailure(this.error));
    }
}
