/**
 * Merges two types A and B into a new type that contains all the properties of A and B.
 * This is like `A & B`, but it also works when A or B is `never` and coalesces the result type
 * to the non-never type.
 * @example
 * type AuB = MergeTypes<{ a: string }, { b: number }>; //{ a: string, b: number }
 * const x: AuB = { a: "a", b: 1 };
 *
 * type JustB = MergeTypes<never, { b: number }>; //{ b: number }
 * const y: JustB = { b: 1 };
 */
export type MergeTypes<A, B> = [A] extends [never]
    ? B
    : [B] extends [never]
    ? A
    : A & B;

type testA = MergeTypes<{ a: string }, { b: number }>;
const testA: testA = { a: "a", b: 1 };

type testB = MergeTypes<{ a: string }, never>;
const testB: testB = { a: "a" };
