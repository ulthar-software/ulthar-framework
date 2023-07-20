import { Variant } from "./variant.js";

/**
 * TypeFromTag allows the extraction of a specific variant type
 * given a tag.
 */
export type TypeFromTag<A extends Variant, K extends string> = A extends {
    readonly _tag: K;
}
    ? A
    : never;
