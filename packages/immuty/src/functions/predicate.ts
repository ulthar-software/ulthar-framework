import { Fn } from "./unary.js";

/**
 * A predicate is a function that takes an argument of type `A` and returns a boolean.
 * It is generally used to test whether a value of type `A` satisfies some condition.
 */
export type Predicate<A> = Fn<A, boolean>;
