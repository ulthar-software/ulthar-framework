import { Fn, Result, TaggedError } from "../index.js";
import { AsyncResult } from "./async-result.js";
import { ErrorResult } from "./error-result.js";
import { IResult } from "./result-interface.js";

export class OkResult<TValue, TError extends TaggedError = never>
    implements IResult<TValue, TError>
{
    constructor(private readonly value: TValue) {}

    isOk(): this is OkResult<TValue, TError> {
        return true;
    }

    isError(): this is ErrorResult<TValue, TError> {
        return false;
    }

    unwrap(): TValue {
        return this.value;
    }

    map<TMappedValue>(f: Fn<[TValue], TMappedValue>): OkResult<TMappedValue> {
        return Result.ok(f(this.value));
    }

    asyncMap<TMappedValue>(
        fn: Fn<[TValue], Promise<TMappedValue>>
    ): AsyncResult<TMappedValue, TError> {
        return new AsyncResult(fn(this.value).then((v) => Result.ok(v)));
    }

    flatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[TValue], Result<TMappedValue, TOtherError>>
    ): Result<TMappedValue, TError | TOtherError> {
        return f(this.value);
    }

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[TValue], Promise<Result<TMappedValue, TOtherError>>>
    ): AsyncResult<TMappedValue, TError | TOtherError> {
        return new AsyncResult(f(this.value));
    }

    catchSome(): Result<TValue, never> {
        return this as unknown as Result<TValue, never>;
    }

    catchAll(): Result<TValue, never> {
        return this as unknown as Result<TValue, never>;
    }
}
