import { Error } from "../errors/error.js";
import { TagFromError } from "../errors/tag-from-error.js";
import { Fn } from "../functions/unary.js";
import { Result } from "../results/result.js";

export type EffectRetryOptions<E extends Error> = {
    maxRetries?: number;
    onlyOnErrors?: TagFromError<E>[];
};

export function composeEffectWithRetry<A, B, abDeps, abErr extends Error>(
    f: Fn<abDeps, Promise<Result<B, abErr>>>,
    options: EffectRetryOptions<abErr> = {}
): Fn<abDeps, Promise<Result<B, abErr>>> {
    return async (deps) => {
        const maxRetries = options.maxRetries ?? Infinity;
        let retries = 0;
        let result = await f(deps);
        while (result.isError() && retries < maxRetries) {
            if (
                options.onlyOnErrors &&
                !options.onlyOnErrors.includes(result.unwrapError()._tag)
            ) {
                break;
            }
            result = await f(deps);
            retries++;
        }
        return result;
    };
}
