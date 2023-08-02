import { TaggedError } from "../errors/tagged-error.js";
import { Fn } from "../functions/unary.js";
import { IResult, ResultFoldParams } from "./result-interface.js";
import { Result } from "./result.js";

/**
 * Represents a Successful Result.
 */
export class OkResult<A> implements IResult<A, never> {
    constructor(private readonly value: A) {}

    /**
     * Determine if this Result is a success.
     * Always returns true
     */
    isOk(): this is OkResult<A> {
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
    unwrap(): A {
        return this.value;
    }

    /**
     * Maps the value of the Result into a new value.
     * The mapping function must return a value and that
     * value will be wrapped in a new Result.
     */
    map<B>(f: Fn<A, B>): OkResult<B> {
        return Result.ok(f(this.value));
    }

    /**
     * Maps the value of the Result into a new value.
     * The mapping function must return a Promise of a value
     */
    async asyncMap<B>(fn: Fn<A, Promise<B>>): Promise<Result<B, never>> {
        return Result.ok(await fn(this.value));
    }

    /**
     * Maps the value of the Result into a new Result.
     * The mapping function must return a Result.
     */
    flatMap<B, Be extends TaggedError>(f: Fn<A, Result<B, Be>>): Result<B, Be> {
        return f(this.value);
    }

    /**
     * Maps the value of the Result into a new Result.
     * The mapping function must return a Promise of a Result.
     */
    async asyncFlatMap<B, Be extends TaggedError>(
        f: Fn<A, Promise<Result<B, Be>>>
    ): Promise<Result<B, Be>> {
        return f(this.value);
    }

    fold<B>({ onSuccess }: ResultFoldParams<A, B, never>): OkResult<B> {
        return Result.ok(onSuccess(this.unwrap()));
    }

    async asyncFold<B>({
        onSuccess,
    }: ResultFoldParams<A, Promise<B>, never>): Promise<OkResult<B>> {
        return Result.ok(await onSuccess(this.unwrap()));
    }

    catchAll(): Result<A, never> {
        return this;
    }

    catchSome(): Result<A, never> {
        return this;
    }
}
