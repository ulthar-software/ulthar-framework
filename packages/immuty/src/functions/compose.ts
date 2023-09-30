import { Fn, MaybePromise } from "../index.js";

/**
 * Composes two functions together
 */
export function compose<A, B, C>(
    f: Fn<[A], MaybePromise<B>>,
    g: Fn<[B], MaybePromise<C>>
): Fn<[A], MaybePromise<C>> {
    return (x) => {
        const fResult = f(x);
        if (fResult instanceof Promise) {
            return fResult.then(g);
        }
        return g(fResult);
    };
}
