import { Immutable, TaggedError } from "../index.js";
import { MergeTypes } from "../types/merge-types.js";
import { EffectConstructor, EffectFn } from "./effect-fn.js";

export function pipeEffects<
    A,
    B,
    ADeps = void,
    BDeps = void,
    AErr extends TaggedError = never,
    BErr extends TaggedError = never
>(
    f: EffectFn<ADeps, A, AErr>,
    g: EffectConstructor<A, B, BDeps, BErr>
): EffectFn<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
    return async (deps) => {
        const result = await f(deps as ADeps);
        return result.asyncFlatMap((a) => g(a).run(deps as BDeps));
    };
}
