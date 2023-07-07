import { Error } from "../errors/error.js";
import { AsyncBinaryFn, BinaryFn } from "../functions/binary.js";
import { Immutable } from "../immutability/immutable.js";
import { Result } from "../results/result.js";
import { MergeTypes } from "../types/merge-types.js";
import {
    AsyncEffectFn,
    composeEffects,
    foldEffect,
    liftAsyncEffect,
} from "./effect-functions.js";
import { EffectRetryOptions, composeEffectWithRetry } from "./retry.js";

/**
 * An effect is a representation of a behavior that could have side effects, and that it could fail.
 */
export class Effect<A, B, abDeps, abErr extends Error> {
    static of<B, A = void, abDeps = void, abErr extends Error = never>(
        f: AsyncBinaryFn<Immutable<A>, abDeps, B>,
        e?: BinaryFn<unknown, abDeps, abErr>
    ): Effect<A, B, abDeps, abErr> {
        return new Effect(liftAsyncEffect(f, e));
    }

    static ofSync<B, A = void, abDeps = void, abErr extends Error = never>(
        f: BinaryFn<Immutable<A>, abDeps, B>,
        e?: BinaryFn<unknown, abDeps, abErr>
    ): Effect<A, B, abDeps, abErr> {
        return new Effect(
            liftAsyncEffect((a, deps) => Promise.resolve(f(a, deps)), e)
        );
    }

    map<C, bcDeps, bcErr extends Error = never>(
        g: AsyncBinaryFn<Immutable<B>, bcDeps, C>,
        e?: BinaryFn<unknown, bcDeps, bcErr>
    ): Effect<A, C, MergeTypes<abDeps, bcDeps>, abErr | bcErr> {
        return this.flatMap(liftAsyncEffect(g, e));
    }

    flatMap<C, bcDeps, bcErr extends Error>(
        g: AsyncEffectFn<B, bcDeps, Result<C, bcErr>>
    ): Effect<A, C, MergeTypes<abDeps, bcDeps>, abErr | bcErr> {
        return new Effect(composeEffects(this.f, g));
    }

    pipe<C, acDeps, acErr extends Error>(
        effect: Effect<B, C, acDeps, acErr>
    ): Effect<A, C, MergeTypes<abDeps, acDeps>, abErr | acErr> {
        return this.flatMap(effect.f);
    }

    fold<C, bcDeps, bcErr extends Error>(
        g: AsyncBinaryFn<Immutable<B>, bcDeps, C>,
        e: AsyncBinaryFn<abErr, bcDeps, C>
    ): Effect<A, C, MergeTypes<abDeps, bcDeps>, bcErr> {
        return new Effect(foldEffect(this.f, g, e));
    }

    retry(opts?: EffectRetryOptions<abErr>): Effect<A, B, abDeps, abErr> {
        return new Effect(composeEffectWithRetry(this.f, opts));
    }

    execute(value: A, dependencies: abDeps): Promise<Result<B, abErr>> {
        return this.f(value as Immutable<A>, dependencies);
    }

    private constructor(
        private readonly f: AsyncEffectFn<A, abDeps, Result<B, abErr>>
    ) {}
}
