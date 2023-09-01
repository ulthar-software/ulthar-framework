import { Fn, MaybePromise, Result, TaggedError } from "../index.js";
import { Effect } from "./effect.js";

/**
 * An effect function is a function that receives a dependencies object
 * and returns a promise of a result.
 */
export type EffectFn<Deps, A, Err extends TaggedError> = Fn<
    [Deps],
    MaybePromise<Result<A, Err>>
>;

/**
 * A piped effect function is a function that receives a tuple of a value
 * and a dependencies object and returns a promise of a result.
 */
export type PipeableEffectFn<Deps, A, B, Err extends TaggedError> = Fn<
    [A, Deps],
    MaybePromise<Result<B, Err>>
>;

/**
 * An effect constructor is a function that receives a value and returns an effect.
 */
export type EffectConstructor<A, B, Deps, Err extends TaggedError> = Fn<
    [A],
    Effect<Deps, B, Err>
>;
