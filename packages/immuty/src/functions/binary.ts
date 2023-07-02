/**
 * A binary function takes two arguments of type `A` and `B` and returns a value of type `C`.
 */
export type BinaryFn<A, B, C> = (x: A, y: B) => C;

/**
 * Takes two arguments of type `A` and `B` and returns a value of type `C` wrapped in a promise.
 */
export type AsyncBinaryFn<A, B, C> = (x: A, y: B) => Promise<C>;
