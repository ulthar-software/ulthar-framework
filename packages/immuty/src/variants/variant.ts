/**
 * A variant type is a type that can be one of a set of types.
 * It represents a pattern matchable construct in the type system.
 */
export interface Variant {
    readonly _tag: string;
}
