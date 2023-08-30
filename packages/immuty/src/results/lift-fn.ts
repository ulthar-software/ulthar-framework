import { TaggedError, wrapUnexpectedError } from "../errors/index.js";
import { Fn, compose } from "../functions/index.js";
import { MaybePromise } from "../index.js";
import { MaybePromisedResult } from "./maybe-promised-result.js";
import { Result } from "./result.js";

export function liftFn<A, B, AErr extends TaggedError = never>(
    f: Fn<A, B>,
    onFailure?: Fn<unknown, MaybePromise<AErr>>
): Fn<A, MaybePromisedResult<B, AErr>> {
    const errorHandler = compose(
        onFailure ?? (wrapUnexpectedError as Fn<unknown, AErr>),
        Result.error
    );
    return (x: A) => {
        try {
            const result = f(x);
            if (result instanceof Promise) {
                return result
                    .then(Result.ok)
                    .catch(errorHandler) as MaybePromisedResult<B, AErr>;
            } else {
                return Result.ok(result) as MaybePromisedResult<B, AErr>;
            }
        } catch (error) {
            return errorHandler(error) as MaybePromisedResult<B, AErr>;
        }
    };
}
