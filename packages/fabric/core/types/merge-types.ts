/**
 * Merges two types A and B into a new type that contains all the properties of A and B.
 * This is like `A & B`, but it also works when A or B are `never` or `void` and coalesces the result type
 * to the non-never type.
 * @example
 * type AuB = MergeTypes<{ a: string }, { b: number }>; //{ a: string, b: number }
 * const x: AuB = { a: "a", b: 1 };
 *
 * type JustB = MergeTypes<never, { b: number }>; //{ b: number }
 * const y: JustB = { b: 1 };
 */
export type MergeTypes<A, B> = [A] extends [void] | [never] ? B
  : [B] extends [void] | [never] ? A
  : A & B;
