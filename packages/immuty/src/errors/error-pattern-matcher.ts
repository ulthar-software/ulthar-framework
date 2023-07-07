import { ErrorFromTag } from "./error-from-tag.js";
import { TaggedError } from "./error.js";

/**
 * A pattern matcher for errors.
 */
export type ErrorPatternMatcher<E extends TaggedError, F> = {
    [K in E["_tag"]]: (error: ErrorFromTag<E, K>) => F;
};

/**
 * Extracts the handled error types of the given error pattern matcher.
 */
export type MatchedErrorsIn<T> = {
    [K in keyof T]: T[K] extends (error: infer E) => any ? E : never;
}[keyof T];
