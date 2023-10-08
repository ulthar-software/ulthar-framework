import { AsyncResult, TaggedError, resultify } from "../index.js";
import { Fn } from "../utils/functions/function.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";

export function effectify<
    TResultValue,
    TFnResult extends MaybePromise<unknown>,
    TArgs extends unknown[],
    TError extends TaggedError = never,
>(fn: Fn<TArgs, TFnResult>): Fn<TArgs, AsyncResult<TResultValue, TError>> {
    return resultify(async (...args: TArgs) => await fn(...args)) as Fn<
        TArgs,
        AsyncResult<TResultValue, TError>
    >;
}
