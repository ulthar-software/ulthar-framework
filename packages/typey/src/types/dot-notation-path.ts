import { TypeOfArrayItems } from "./typeof-array-items.js";

type KeyPathWithArray<
    T,
    Key extends keyof T & string
> = T[Key] extends Array<any>
    ? `${Key}.${keyof TypeOfArrayItems<T[Key]> & string}`
    : T[Key] extends Record<string, any>
    ?
          | `${Key}.${KeyPathWithArray<T[Key], keyof T[Key] & string>}`
          | `${Key}.${keyof T[Key] & string}`
    : never;

/**
 * Allows type safety of dot.notation strings representing object key paths.
 * This type also allows to reference keys inside array item types.
 */
export type DotNotationPath<T> =
    | KeyPathWithArray<T, keyof T & string>
    | keyof T;
