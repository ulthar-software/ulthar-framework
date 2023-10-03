import { TaggedError } from "../errors/tagged-error.js";
import { Result } from "./result.js";
import { Fn } from "../utils/functions/function.js";
import { Immutable } from "../utils/immutability/immutable.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";

export class AsyncResult<TValue, TError extends TaggedError> {
    constructor(private promise: Promise<Result<TValue, TError>>) {}

    async resolve() {
        return await this.promise;
    }

    asyncMap<TMappedValue>(
        mapFn: Fn<[Immutable<TValue>], MaybePromise<TMappedValue>>
    ): AsyncResult<TMappedValue, TError> {
        return new AsyncResult(
            this.promise.then(async (v) => {
                if (v.isOk()) {
                    return Result.ok(await mapFn(v.value));
                } else {
                    return v as unknown as Result<TMappedValue, TError>;
                }
            })
        );
    }

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        mapFn: Fn<
            [Immutable<TValue>],
            MaybePromise<Result<TMappedValue, TOtherError>>
        >
    ): AsyncResult<TMappedValue, TError | TOtherError> {
        return new AsyncResult(
            this.promise.then(async (v) => {
                if (v.isOk()) {
                    return await mapFn(v.value);
                } else {
                    return v as unknown as Result<TMappedValue, TError>;
                }
            })
        );
    }
}
