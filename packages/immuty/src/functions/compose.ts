import { Fn } from "./function.js";

/**
 * Composes two functions.
 */
export function compose<A, B, C>(f: Fn<A, B>, g: Fn<B, C>): Fn<A, C> {
    return (x) => g(f(x));
}
