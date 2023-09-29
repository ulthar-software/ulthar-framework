import { Fn, Result, TaggedError } from "../index.js";
import { ErrorResult } from "./error-result.js";
import { OkResult } from "./ok-result.js";

export interface ResultFoldParams<
    TValue,
    TMappedValue,
    TError extends TaggedError,
> {
    onSuccess: Fn<[TValue], TMappedValue>;
    onFailure: Fn<[TError], TMappedValue>;
}

export function isResult(
    value: unknown
): value is Result<unknown, TaggedError> {
    return value instanceof OkResult || value instanceof ErrorResult;
}
