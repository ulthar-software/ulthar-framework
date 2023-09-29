import { Fn, MaybePromise, Result, TaggedError } from "../index.js";

export class AsyncResult<TValue, TError extends TaggedError> {
    constructor(private promise: Promise<Result<TValue, TError>>) {}

    async resolve() {
        return await this.promise;
    }

    asyncMap<TMappedValue>(mapFn: Fn<[TValue], MaybePromise<TMappedValue>>) {
        return new AsyncResult(
            this.promise.then(async (v) => {
                if (v.isOk()) {
                    return Result.ok(await mapFn(v.unwrap()));
                } else {
                    return v as unknown as Result<TMappedValue, TError>;
                }
            })
        );
    }

    asyncFlatMap<TMappedValue, TOtherError extends TaggedError>(
        mapFn: Fn<[TValue], MaybePromise<Result<TMappedValue, TOtherError>>>
    ) {
        return new AsyncResult(
            this.promise.then(async (v) => {
                if (v.isOk()) {
                    return await mapFn(v.unwrap());
                } else {
                    return v;
                }
            })
        );
    }
}
