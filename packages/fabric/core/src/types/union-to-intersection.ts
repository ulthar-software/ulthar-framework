/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Converts a union type to an intersection type.
 * Given an union type, ie. `A | B | C`, it returns an intersection type `A & B & C`.
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
