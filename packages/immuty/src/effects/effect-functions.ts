import { Error } from "../errors/error.js";
import { BinaryFn } from "../functions/binary.js";
import { Fn } from "../functions/unary.js";
import { Immutable } from "../immutability/immutable.js";
import { Result } from "../results/result.js";
import { MergeTypes } from "../types/merge-types.js";
import { Effect } from "./effect.js";

export function composeEffects<
    A,
    B,
    aDeps,
    bDeps,
    aE extends Error,
    bE extends Error
>(
    f: Fn<aDeps, Promise<Result<A, aE>>>,
    g: BinaryFn<Immutable<A>, bDeps, Promise<Result<B, bE>>>
): Fn<MergeTypes<aDeps, bDeps>, Promise<Result<B, aE | bE>>> {
    return async (deps) => {
        const result = await f(deps as aDeps);
        return result.asyncFlatMap((value) => g(value, deps as bDeps));
    };
}

export function pipeEffects<
    A,
    B,
    aDeps,
    bDeps,
    aE extends Error,
    bE extends Error
>(
    f: Fn<aDeps, Promise<Result<A, aE>>>,
    g: Fn<Immutable<A>, Effect<bDeps, B, bE>>
): Fn<MergeTypes<aDeps, bDeps>, Promise<Result<B, aE | bE>>> {
    return async (deps) => {
        const result = await f(deps as aDeps);
        return await result.asyncFlatMap((value) =>
            g(value).run(deps as bDeps)
        );
    };
}

export function foldEffect<A, B, C, abDeps, bcDeps, abE extends Error>(
    f: Fn<abDeps, Promise<Result<B, abE>>>,
    g: BinaryFn<Immutable<B>, bcDeps, Promise<C>>,
    e: BinaryFn<abE, bcDeps, Promise<C>>
): Fn<MergeTypes<abDeps, bcDeps>, Promise<Result<C, never>>> {
    return async (deps) => {
        const result = await f(deps as abDeps);
        return await result.asyncFold({
            onSuccess: (value) => g(value, deps as bcDeps),
            onFailure: (error) => e(error, deps as bcDeps),
        });
    };
}
