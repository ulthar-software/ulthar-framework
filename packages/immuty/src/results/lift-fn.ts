import { TaggedError, defaultErrorWrapper } from "../errors/index.js";
import { Fn, compose } from "../functions/index.js";
import { MaybePromisedResult } from "./maybe-promised-result.js";
import { Result } from "./result.js";

export function liftFn<A, B, AErr extends TaggedError = never>(
    f: Fn<A, B>,
    onFailure?: Fn<unknown, AErr>
): Fn<A, MaybePromisedResult<B, AErr>> {
    return (x: A) => {
        try {
            const result = f(x);
            if (result instanceof Promise) {
                return result
                    .then(Result.ok)
                    .catch(
                        compose(
                            onFailure
                                ? onFailure
                                : (defaultErrorWrapper as Fn<unknown, AErr>),
                            Result.error
                        )
                    ) as MaybePromisedResult<B, AErr>;
            } else {
                return Result.ok(result) as MaybePromisedResult<B, AErr>;
            }
        } catch (error) {
            return Result.error(
                onFailure ? onFailure(error) : defaultErrorWrapper(error)
            ) as MaybePromisedResult<B, AErr>;
        }
    };
}
