import { Fn } from "../utils/functions/function.js";
import { TypeFromTag } from "./type-from-tag.js";
import { TaggedVariant } from "./tagged-variant.js";

/**
 * A pattern matcher is a map from variant tags to functions
 * that handle the specific variant.
 */
export type PatternMatcher<TVariant extends TaggedVariant, TValue> =
    | {
          [K in TVariant["_tag"]]: Fn<[TypeFromTag<TVariant, K>], TValue>;
      }
    | DefaultPatternMatcher<TVariant, TValue>
    | (PartialPatternMatcher<TVariant, TValue> &
          DefaultPatternMatcher<TVariant, TValue>);

export type DefaultPatternMatcher<TVariant extends TaggedVariant, TValue> = {
    [DefaultVariant]: (error: TVariant) => TValue;
};

export type PartialPatternMatcher<TVariant extends TaggedVariant, TValue> = {
    [K in TVariant["_tag"] & string]?: Fn<
        [TypeFromTag<TVariant, K & string>],
        TValue
    >;
};

export const DefaultVariant = Symbol("DefaultVariant");
export type DefaultVariant = typeof DefaultVariant;

export type ValidMatcherKey<TVariant> =
    | (TVariant extends TaggedVariant
          ? TVariant["_tag"]
          : TVariant extends string
          ? TVariant
          : string | number | symbol)
    | DefaultVariant;

export type CaseMatcher<TVariant, TFn extends Fn<[TVariant], unknown>> = {
    [K in ValidMatcherKey<TVariant>]?: TFn;
} & {
    [DefaultVariant]?: TFn;
};
