import { isTaggedError } from "../errors/is-tagged-error.js";
import { TaggedError } from "../errors/tagged-error.js";
import { wrapUnexpectedError } from "../errors/unexpected-error.js";
import { Result } from "./result.js";
import { Fn } from "../utils/functions/function.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";
import { AsyncResult } from "./async-result.js";
import { isResult } from "./utils.js";

/**
 * Converts a function that returns a value of type TValue, or tagged errors of
 * type TError into a function that returns a
 * Result<TValue,TError>
 *
 * Any non-tagged error that happens on the original function
 * is also converted into an UnexpectedError tagged error
 */
export function resultify<
    TFnResult extends MaybePromise<unknown>,
    TArgs extends unknown[],
>(fn: Fn<TArgs, TFnResult>): Fn<TArgs, InferredResult<TFnResult>> {
    return (...args: TArgs) => {
        try {
            const result = fn(...args);
            if (isResult(result)) {
                return result as InferredResult<TFnResult>;
            }
            if (result instanceof Promise) {
                return new AsyncResult(
                    result
                        .then((r) => {
                            if (isResult(r)) {
                                return r;
                            }
                            if (isTaggedError(r)) {
                                return Result.error(r);
                            }
                            return Result.ok(r);
                        })
                        .catch((e) =>
                            Result.error(wrapUnexpectedError(e) as never)
                        )
                ) as InferredResult<TFnResult>;
            }
            if (isTaggedError(result)) {
                return Result.error(result) as InferredResult<TFnResult>;
            }
            return Result.ok(result) as InferredResult<TFnResult>;
        } catch (error) {
            return Result.error(
                wrapUnexpectedError(error) as never
            ) as InferredResult<TFnResult>;
        }
    };
}

export type SeparatedValue<T> = Exclude<Awaited<T>, TaggedError>;
export type SeparatedErrors<T> = Extract<Awaited<T>, TaggedError>;

export type InferredResult<T> = T extends Result<unknown, TaggedError>
    ? T
    : T extends Promise<infer TP>
    ? TP extends Result<unknown, TaggedError>
        ? AsyncResult<ExtractedValue<TP>, ExtractedErrors<TP>>
        : AsyncResult<SeparatedValue<TP>, SeparatedErrors<TP>>
    : Result<SeparatedValue<T>, SeparatedErrors<T>>;

export type ExtractedValue<T> = T extends Result<infer TValue, TaggedError>
    ? TValue
    : T extends AsyncResult<infer TValue, TaggedError>
    ? TValue
    : never;
export type ExtractedErrors<T> = T extends Result<unknown, infer TError>
    ? TError
    : T extends AsyncResult<unknown, infer TError>
    ? TError
    : never;
