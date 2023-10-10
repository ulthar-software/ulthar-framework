import {
    DefaultPatternMatcher,
    PartialPatternMatcher,
    PatternMatcher,
} from "../index.js";
import { ErrorFromTag } from "./error-from-tag.js";
import { TagFromError } from "./tag-from-error.js";
import { TaggedError } from "./tagged-error.js";

/**
 * A default Pattern Matcher for any errors.
 */
export type DefaultErrorPatternMatcher<
    TError extends TaggedError,
    TValue,
> = DefaultPatternMatcher<TError, TValue>;

/**
 * A Pattern Matcher for errors.
 */
export type ErrorPatternMatcher<
    TError extends TaggedError,
    TValue,
> = PatternMatcher<TError, TValue>;

/**
 * A partial Pattern Matcher for errors.
 */
export type PartialErrorPatternMatcher<
    TError extends TaggedError,
    TValue,
> = PartialPatternMatcher<TError, TValue>;

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
