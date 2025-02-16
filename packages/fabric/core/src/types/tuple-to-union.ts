/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This is an example of a utility type that converts a tuple to a union.
 * This is not useful by itself as it is the same as `T[number]`.
 *
 * But, if you have the following type:
 *
 * ```ts
 * const X = [A, B, C] as const;
 * type X = typeof X;
 * ```
 * With a transformation like this:
 * ```ts
 * type Y = Z<X>
 * ```
 * This will result in:
 * ```ts
 * type Y = Z<A | B | C>;
 * ```
 * If what you need is actually:
 * ```ts
 * type Y = Z<A> | Z<B> | Z<C>;
 * ```
 * You can take this example and make a type like this:
 *
 * ```ts
 * type TupleToUnionWithTransformation<T extends readonly any[]> = {
 *   [K in keyof T]: Z<T[K]>;
 * }[number];
 * type Y = TupleToUnion<X>;
 * ```
 *
 * And you will get the expected result.
 */
export type TupleToUnion<T extends readonly any[]> = {
  [K in keyof T]: T[K];
}[number];
