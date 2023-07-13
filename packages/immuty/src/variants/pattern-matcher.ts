import { Fn } from "../functions/unary.js";
import { TypeFromTag } from "./type-from-tag.js";
import { Variant } from "./variant.js";

/**
 * A pattern matcher is a map from variant tags to functions
 * that handle the specific variant.
 */
export type PatternMatcher<A extends Variant, B> =
    | {
          [K in A["_tag"]]: Fn<TypeFromTag<A, K>, B>;
      }
    | DefaultPatternMatcher<A, B>
    | (PartialPatternMatcher<A, B> & DefaultPatternMatcher<A, B>);

export type DefaultPatternMatcher<A extends Variant, B> = {
    "*": (error: A) => B;
};

export type PartialPatternMatcher<A extends Variant, B> = {
    [K in A["_tag"]]?: Fn<TypeFromTag<A, K>, B>;
};
