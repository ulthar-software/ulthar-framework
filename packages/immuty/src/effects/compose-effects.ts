import { TaggedError } from "../index.js";
import { MergeTypes } from "../types/merge-types.js";
import { EffectFn, PipeableEffectFn } from "./effect-fn.js";

/**
 * Composes two effect functions into a single effect function.
 * @param f a normal effect function
 * @param g a pipe-able effect function, that not only receives a dependencies object, but also a value
 * @returns a new effect function that first runs `f` and then pipes its result into `g`
 */
export function composeEffects<
    A,
    B,
    ADeps = void,
    BDeps = void,
    AErr extends TaggedError = never,
    BErr extends TaggedError = never,
>(
    f: EffectFn<ADeps, A, AErr>,
    g: PipeableEffectFn<BDeps, A, B, BErr>
): EffectFn<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
    return async (deps) => {
        const result = await f(deps as ADeps);
        return result.asyncFlatMap((a) => g([a, deps as BDeps]));
    };
}
