import { Fn, MaybePromise, Result } from "../index.js";
import { TypeFromTag } from "./type-from-tag.js";
import { Variant } from "./variant.js";

/**
 * A pattern matcher is a map from variant tags to functions
 * that handle the specific variant.
 */
export type PatternMatcher<
    A extends Variant,
    B,
    MP extends MaybePromise<Result<B, never>>,
> =
    | {
          [K in A["_tag"]]: Fn<[TypeFromTag<A, K>], MP>;
      }
    | DefaultPatternMatcher<A, B, MP>
    | (PartialPatternMatcher<A, B, MP> & DefaultPatternMatcher<A, B, MP>);

export type DefaultPatternMatcher<
    A extends Variant,
    B,
    MP extends MaybePromise<Result<B, never>>,
> = {
    "*": (error: A) => MP;
};

export type PartialPatternMatcher<
    A extends Variant,
    B,
    MP extends MaybePromise<Result<B, never>>,
> = {
    [K in A["_tag"] & string]?: Fn<[TypeFromTag<A, K & string>], MP>;
};
