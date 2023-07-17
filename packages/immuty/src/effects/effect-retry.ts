import { Result, TagFromError, TaggedError } from "../index.js";
import { Schedule } from "../time/schedule.js";
import { EffectFn } from "./effect-fn.js";

export interface RetryOpts<AErr extends TaggedError> {
    onlyOn?: TagFromError<AErr>[];
}

export function composeEffectWithRetry<ADeps, A, AErr extends TaggedError>(
    f: EffectFn<ADeps, A, AErr>,
    schedule: Schedule,
    opts: RetryOpts<AErr> = {}
): EffectFn<ADeps, A, AErr> {
    return async (deps) => {
        let result = await f(deps);
        if (result.isOk()) {
            return result;
        }

        for await (const _ of schedule) {
            if (shouldRetry(result, opts)) {
                result = await f(deps);
            } else {
                return result;
            }
        }
        return result;
    };
}

function shouldRetry<AErr extends TaggedError>(
    result: Result<unknown, AErr>,
    opts: RetryOpts<AErr>
): boolean {
    if (result.isOk()) {
        return false;
    } else {
        if (opts.onlyOn) {
            return opts.onlyOn.includes(result.unwrapError()._tag);
        } else {
            return true;
        }
    }
}
