import { Fn } from "./unary.js";

/**
 *  It takes an argument of type `unknown` and returns a value of type `T`.
 */
export type Caster<T> = Fn<unknown, T>;
