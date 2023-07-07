import { Error } from "../errors/error.js";
import { AsyncBinaryFn, BinaryFn } from "../functions/binary.js";
import { Immutable } from "../immutability/immutable.js";
import { Result, SomeResult } from "../results/result.js";
import { MergeTypes } from "../types/merge-types.js";

export type AsyncEffectMapFn<A, Dependencies, B> = AsyncBinaryFn<
    Dependencies,
    Immutable<A>,
    B
>;

export type AsyncEffectFn<
    A,
    Dependencies,
    B extends SomeResult
> = AsyncBinaryFn<Dependencies, Immutable<A>, B>;

export function liftEffectMap<A, B, abDeps>(
    fn: AsyncEffectMapFn<A, abDeps, B>
): AsyncEffectFn<A, abDeps, Result<B, never>> {
    return async (dependencies, value) => {
        const result = await fn(dependencies, value);
        return Result.ok(result);
    };
}

export function liftAsyncEffect<A, B, abDeps, E extends Error = never>(
    f: AsyncBinaryFn<abDeps, Immutable<A>, B>,
    e?: BinaryFn<abDeps, unknown, E>
): AsyncEffectFn<A, abDeps, Result<B, E>> {
    return async (deps, value) => {
        try {
            return await liftEffectMap(f)(deps, value);
        } catch (error) {
            if (e) {
                return Result.error(e(deps, error)) as Result<B, E>;
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
    return async (dependencies, value) => {
        const result = await f(dependencies as abDeps, value);
        return result.asyncFlatMap((value) => g(dependencies as bcDeps, value));
    };
}

export function foldEffect<A, B, C, abDeps, bcDeps, abE extends Error>(
    f: AsyncEffectFn<A, abDeps, Result<B, abE>>,
    g: AsyncBinaryFn<bcDeps, Immutable<B>, C>,
    e: AsyncBinaryFn<bcDeps, abE, C>
): AsyncEffectFn<A, MergeTypes<abDeps, bcDeps>, Result<C, never>> {
    return async (dependencies, a) => {
        const result = await f(dependencies as abDeps, a);
        return await result.asyncFold(
            (value) => g(dependencies as bcDeps, value),
            (error) => e(dependencies as bcDeps, error)
        );
    };
}
