import { TaggedVariant } from "../tagged-variant.js";

/**
 * TypeFromTag allows the extraction of a specific variant type
 * given a tag.
 */
export type TypeFromTag<A extends TaggedVariant, K extends string> = A extends {
    readonly _tag: K;
}
    ? A
    : never;
