import { Error } from "../errors/error.js";
import { AsyncBinaryFn, BinaryFn } from "../functions/binary.js";
import { Immutable } from "../immutability/immutable.js";
import { Result, SomeResult } from "../results/result.js";
import { MergeTypes } from "../types/merge-types.js";

export type AsyncEffectMapFn<A, Dependencies, B> = AsyncBinaryFn<
    Immutable<A>,
    Dependencies,
    B
>;

export type AsyncEffectFn<
    A,
    Dependencies,
    B extends SomeResult
> = AsyncBinaryFn<Immutable<A>, Dependencies, B>;

export function liftEffectMap<A, B, abDeps>(
    fn: AsyncEffectMapFn<A, abDeps, B>
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

export function foldEffect<A, B, C, abDeps, bcDeps, abE extends Error>(
    f: AsyncEffectFn<A, abDeps, Result<B, abE>>,
    g: AsyncBinaryFn<Immutable<B>, bcDeps, C>,
    e: AsyncBinaryFn<abE, bcDeps, C>
): AsyncEffectFn<A, MergeTypes<abDeps, bcDeps>, Result<C, never>> {
    return async (a, dependencies) => {
        const result = await f(a, dependencies as abDeps);
        return await result.asyncFold(
            (value) => g(value, dependencies as bcDeps),
            (error) => e(error, dependencies as bcDeps)
        );
    };
}
