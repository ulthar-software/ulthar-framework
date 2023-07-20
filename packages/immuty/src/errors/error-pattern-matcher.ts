import { ErrorFromTag } from "./error-from-tag.js";
import { TagFromError } from "./tag-from-error.js";
import { TaggedError } from "./tagged-error.js";

/**
 * A default Pattern Matcher for any errors.
 */
export type DefaultErrorPatternMatcher<E extends TaggedError, F> = {
    "*": (error: E) => F;
};

/**
 * A Pattern Matcher for errors.
 */
export type ErrorPatternMatcher<E extends TaggedError, F> =
    | {
          [K in E["_tag"]]: (error: ErrorFromTag<E, K>) => F;
      }
    | (PartialErrorPatternMatcher<E, F> & DefaultErrorPatternMatcher<E, F>)
    | DefaultErrorPatternMatcher<E, F>;

/**
 * A partial Pattern Matcher for errors.
 */
export type PartialErrorPatternMatcher<E extends TaggedError, F> = {
    [K in E["_tag"]]?: (error: ErrorFromTag<E, K>) => F;
};

/**
 * Extracts the handled error types of the given error pattern matcher.
 */
export type RemainingUnmatchedErrors<
    AErr extends TaggedError,
    MatcherType,
> = ErrorFromTag<
    AErr,
    Exclude<TagFromError<AErr>, Exclude<keyof MatcherType, "*">>
>;
