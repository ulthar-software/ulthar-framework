import {
    ArrayType,
    EffectFn,
    ErrorResult,
    IEventSource,
    Result,
    TaggedError,
} from "../index.js";

export function listEffectToAsyncGenerator<
    A extends unknown[],
    ADeps = void,
    AErr extends TaggedError = never,
>(
    effect: EffectFn<ADeps, A, AErr>
): (deps: ADeps) => IEventSource<ArrayType<A>, AErr> {
    return async function* (deps: ADeps) {
        const result = await effect(deps);
        if (result.isOk()) {
            for (const item of result.unwrap()) {
                yield Result.ok(item as ArrayType<A>);
            }
        } else {
            yield result as ErrorResult<ArrayType<A>, AErr>;
        }
    };
}
