import { Error } from "../errors/error.js";
import { Immutable } from "../immutable/immutable.js";
import { Result, SomeResult } from "../results/result.js";
import { MergeTypes } from "../types/merge-types.js";
import { AsyncBinaryFn, BinaryFn } from "../types/functions.js";

export type AsyncEffectMapFn<A, B, Dependencies> = BinaryFn<
    Immutable<A>,
    Dependencies,
    Promise<B>
>;

export type AsyncEffectFn<A, Dependencies, B extends SomeResult> = BinaryFn<
    Immutable<A>,
    Dependencies,
    Promise<B>
>;

export function liftEffectMap<A, B, abDeps>(
    fn: AsyncEffectMapFn<A, B, abDeps>
): AsyncEffectFn<A, abDeps, Result<B, never>> {
    return async (value, dependencies) => {
        const result = await fn(value, dependencies);
        return Result.ok(result);
    };
}

export function liftAsyncEffect<A, B, abDeps, E extends Error = never>(
    f: AsyncBinaryFn<Immutable<A>, abDeps, B>,
    e?: BinaryFn<unknown, abDeps, E>
): AsyncEffectFn<A, abDeps, Result<B, E>> {
    return async (value, dependencies) => {
        try {
            return await liftEffectMap(f)(value, dependencies);
        } catch (error) {
            if (e) {
                return Result.error(e(error, dependencies)) as Result<B, E>;
            }
            throw error;
        }
    };
}

export function composeEffects<
    A,
    B,
    C,
    abDeps,
    bcDeps,
    abE extends Error,
    bcE extends Error
>(
    f: AsyncEffectFn<A, abDeps, Result<B, abE>>,
    g: AsyncEffectFn<B, bcDeps, Result<C, bcE>>
): AsyncEffectFn<A, MergeTypes<abDeps, bcDeps>, Result<C, abE | bcE>> {
    return async (value, dependencies) => {
        const result = await f(value, dependencies as abDeps);
        return result.asyncFlatMap((value) => g(value, dependencies as bcDeps));
    };
}
