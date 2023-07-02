/**
 * A function that takes an argument of type `A` and returns a value of type `B`.
 */
export type Fn<A, B> = (a: A) => B;

/**
 * It takes a value of type `A` and returns a value of type `B` wrapped
 * in a promise.
 */
export type AsyncFn<A, B> = Fn<A, Promise<B>>;
