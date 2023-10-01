import { TaggedError } from "../errors/tagged-error.js";
import { Result } from "../result.js";
import { Fn } from "../utils/functions/function.js";
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
