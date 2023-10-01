import { Result } from "../result.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";
import { ErrorFromTag } from "./error-from-tag.js";
import { TagFromError } from "./tag-from-error.js";
import { TaggedError } from "./tagged-error.js";

/**
 * A default Pattern Matcher for any errors.
 */
export type DefaultErrorPatternMatcher<
    E extends TaggedError,
    F,
    MP extends MaybePromise<Result<F, never>>,
> = {
    "*": (error: E) => MP;
};

/**
 * A Pattern Matcher for errors.
 */
export type ErrorPatternMatcher<
    E extends TaggedError,
    F,
    MP extends MaybePromise<Result<F, never>>,
> =
    | {
          [K in E["_tag"]]: (error: ErrorFromTag<E, K>) => MP;
      }
    | (PartialErrorPatternMatcher<E, F, MP> &
          DefaultErrorPatternMatcher<E, F, MP>)
    | DefaultErrorPatternMatcher<E, F, MP>;

/**
 * A partial Pattern Matcher for errors.
 */
export type PartialErrorPatternMatcher<
    E extends TaggedError,
    F,
    MP extends MaybePromise<Result<F, never>>,
> = {
    [K in E["_tag"] & string]?: (error: ErrorFromTag<E, K & string>) => MP;
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

export type ExtractPatternMatcherResult<A, PM> =
    PM extends PartialErrorPatternMatcher<TaggedError, A, infer MP>
        ? MP
        : never;
