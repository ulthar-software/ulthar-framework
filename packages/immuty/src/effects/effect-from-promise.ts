import { ErrorWrapper } from "../errors/create-native-error-wrapper.js";
import { Fn, Result, TaggedError, defaultErrorWrapper } from "../index.js";
import { EffectFn } from "./effect-fn.js";

export function effectFromPromise<
    ADeps = void,
    A = void,
    AErr extends TaggedError = never,
>(f: Fn<ADeps, Promise<A>>, e?: ErrorWrapper<AErr>): EffectFn<ADeps, A, AErr> {
    return async (deps): Promise<Result<A, AErr>> => {
        try {
            const result = await f(deps);
            return Result.ok(result) as Result<A, AErr>;
        } catch (err) {
            if (!e) {
                return Result.error(defaultErrorWrapper(err)) as Result<
                    A,
                    AErr
                >;
            }
            return Result.error(e(err)) as Result<A, AErr>;
        }
    };
}
