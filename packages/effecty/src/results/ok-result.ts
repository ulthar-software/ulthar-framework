import { TaggedError } from "../errors/tagged-error.js";
import { Result } from "./result.js";
import { Fn } from "../utils/functions/function.js";
import { Immutable } from "../utils/immutability/immutable.js";
import { shallowClone } from "../utils/immutability/shallow-clone.js";
import { AsyncResult } from "./async-result.js";
import { ErrorResult } from "./error-result.js";
import { IResult } from "./result-interface.js";

export class OkResult<TValue, TError extends TaggedError = never>
    implements IResult<TValue, TError>
{
    readonly value: Immutable<TValue>;

    constructor(value: TValue) {
        this.value = value as Immutable<TValue>;
    }

    isOk(): this is OkResult<TValue, TError> {
        return true;
    }

    isError(): this is ErrorResult<TValue, TError> {
        return false;
    }

    unwrap(): TValue {
        return shallowClone(this.value);
    }

    map<TMappedValue>(
        f: Fn<[Immutable<TValue>], TMappedValue>
    ): OkResult<TMappedValue> {
        return Result.ok(f(this.value));
    }

    asyncMap<TMappedValue>(
        fn: Fn<[Immutable<TValue>], Promise<TMappedValue>>
    ): AsyncResult<TMappedValue, TError> {
        return new AsyncResult(fn(this.value).then((v) => Result.ok(v)));
    }

    flatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[Immutable<TValue>], Result<TMappedValue, TOtherError>>
    ): Result<TMappedValue, TError | TOtherError> {
        return f(this.value);
    }

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        f: Fn<[Immutable<TValue>], Promise<Result<TMappedValue, TOtherError>>>
    ): AsyncResult<TMappedValue, TError | TOtherError> {
        return new AsyncResult(f(this.value));
    }

    asyncResultMap<TMappedValue, TOtherError extends TaggedError<string>>(
        f: Fn<[Immutable<TValue>], AsyncResult<TMappedValue, TOtherError>>
    ): AsyncResult<TMappedValue, TError | TOtherError> {
        return f(this.value);
    }

    catchSome(): Result<TValue, never> {
        return this as unknown as Result<TValue, never>;
    }

    catchAll(): Result<TValue, never> {
        return this as unknown as Result<TValue, never>;
    }
}
