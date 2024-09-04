/**
 * Get the element type of an array.
 */
export type ArrayElement<T extends readonly unknown[]> =
  T extends readonly (infer U)[] ? U : never;

/**
 * Get the first element type of a tuple.
 */
export type TupleFirstElement<T extends readonly unknown[]> =
  T extends readonly [infer U, ...unknown[]] ? U : never;

/**
 * Get the LAST element type of a tuple.
 */
export type TupleLastElement<T extends readonly unknown[]> =
  T extends readonly [...unknown[], infer U] ? U : never;
