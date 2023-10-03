import { Result } from "../results/result.js";
import { Fn } from "../utils/functions/function.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";
import { TypeFromTag } from "./type-from-tag.js";
import { TaggedVariant } from "./tagged-variant.js";

/**
 * A pattern matcher is a map from variant tags to functions
 * that handle the specific variant.
 */
export type PatternMatcher<
    A extends TaggedVariant,
    B,
    MP extends MaybePromise<Result<B, never>>,
> =
    | {
          [K in A["_tag"]]: Fn<[TypeFromTag<A, K>], MP>;
      }
    | DefaultPatternMatcher<A, B, MP>
    | (PartialPatternMatcher<A, B, MP> & DefaultPatternMatcher<A, B, MP>);

export type DefaultPatternMatcher<
    A extends TaggedVariant,
    B,
    MP extends MaybePromise<Result<B, never>>,
> = {
    "*": (error: A) => MP;
};

export type PartialPatternMatcher<
    A extends TaggedVariant,
    B,
    MP extends MaybePromise<Result<B, never>>,
> = {
    [K in A["_tag"] & string]?: Fn<[TypeFromTag<A, K & string>], MP>;
};
