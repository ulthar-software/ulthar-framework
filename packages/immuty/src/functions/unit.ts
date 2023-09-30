import { Fn } from "./function.js";

/**
 * A function that takes an argument of type `A` and returns nothing.
 */
export type Unit<A> = Fn<[A], void>;
