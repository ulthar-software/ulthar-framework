/**
 * A binary function takes two arguments of type `A` and `B` and returns a value of type `C`.
 */
export type BinaryFn<A, B, C> = (x: A, y: B) => C;
