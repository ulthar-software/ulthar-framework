import { Error } from "../errors/error.js";
import { TagFromError } from "../errors/tag-from-error.js";
import { Result } from "../results/result.js";
import { AsyncEffectFn } from "./effect-functions.js";

export type EffectRetryOptions<E extends Error> = {
    maxRetries?: number;
    onlyOnErrors?: TagFromError<E>[];
};

export function composeEffectWithRetry<A, B, abDeps, abErr extends Error>(
    f: AsyncEffectFn<A, abDeps, Result<B, abErr>>,
    options: EffectRetryOptions<abErr> = {}
): AsyncEffectFn<A, abDeps, Result<B, abErr>> {
    return async (value, deps) => {
        const maxRetries = options.maxRetries ?? Infinity;
        let retries = 0;
        let result = await f(value, deps);
        while (result.isError() && retries < maxRetries) {
            if (
                options.onlyOnErrors &&
                !options.onlyOnErrors.includes(result.unwrapError()._tag)
            ) {
                break;
            }
            result = await f(value, deps);
            retries++;
        }
        return result;
    };
}
