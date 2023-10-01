export * from "./variants/is-variant.js";
export * from "./variants/match.js";

/**
 * A variant type is a type that can be one of a set of types.
 * It represents a pattern matchable construct in the type system.
 */
export interface TaggedVariant {
    readonly _tag: string;
}
