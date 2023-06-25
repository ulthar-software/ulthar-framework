import { ErrorFromTag } from "./error-from-tag.js";
import { Error, ErrorTag } from "./error.js";

/**
 * A pattern matcher for errors.
 */
export type ErrorPatternMatcher<E extends Error, F> = {
    [K in E[ErrorTag]]: (error: ErrorFromTag<E, K>) => F;
};

/**
 * Extracts the handled error types of the given error pattern matcher.
 */
export type MatchedErrorsIn<T> = {
    [K in keyof T]: T[K] extends (error: infer E) => any ? E : never;
}[keyof T];
