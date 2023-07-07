import { Error } from "../errors/error.js";
import { BinaryFn } from "../functions/binary.js";
import { Fn } from "../functions/unary.js";
import { Immutable } from "../immutability/immutable.js";
import {
    Result,
    liftFaultyAsyncBinaryFn,
    liftFaultyAsyncFn,
} from "../results/result.js";
import { MergeTypes } from "../types/merge-types.js";
import { composeEffects, foldEffect, pipeEffects } from "./effect-functions.js";
import { EffectRetryOptions, composeEffectWithRetry } from "./retry.js";

/**
 * An effect is a representation of a behavior that could have side effects, and that it could fail.
 */
export class Effect<ADeps, A, AErr extends Error> {
    static of<A, aDeps = void, abErr extends Error = never>(
        f: Fn<aDeps, Promise<A>>,
        e?: Fn<unknown, abErr>
    ): Effect<aDeps, A, abErr> {
        return new Effect(liftFaultyAsyncFn(f, e));
    }

    static ofSync<A, ADeps = void, AErr extends Error = never>(
        f: Fn<ADeps, A>,
        e?: Fn<unknown, AErr>
    ): Effect<ADeps, A, AErr> {
        return new Effect(
            liftFaultyAsyncFn((deps) => Promise.resolve(f(deps)), e)
        );
    }

    map<B, BDeps, BErr extends Error = never>(
        g: BinaryFn<Immutable<A>, BDeps, Promise<B>>,
        e?: Fn<unknown, BErr>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return this.flatMap(liftFaultyAsyncBinaryFn(g, e));
    }

    flatMap<B, BDeps, BErr extends Error>(
        g: BinaryFn<Immutable<A>, BDeps, Promise<Result<B, BErr>>>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(composeEffects(this.f, g));
    }

    pipe<B, BDeps, BErr extends Error>(
        g: Fn<Immutable<A>, Effect<BDeps, B, BErr>>
    ): Effect<MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new Effect(pipeEffects(this.f, g));
    }

    fold<B, BDeps>(
        g: BinaryFn<Immutable<A>, BDeps, Promise<B>>,
        e: Fn<AErr, Promise<B>>
    ): Effect<MergeTypes<ADeps, BDeps>, B, never> {
        return new Effect(foldEffect(this.f, g, e));
    }

    retry(opts?: EffectRetryOptions<AErr>): Effect<ADeps, A, AErr> {
        return new Effect(composeEffectWithRetry(this.f, opts));
    }

    run(dependencies: ADeps): Promise<Result<A, AErr>> {
        return this.f(dependencies);
    }

    private constructor(
        private readonly f: Fn<ADeps, Promise<Result<A, AErr>>>
    ) {}
}
