import { createTaggedError } from "./create-tagged-error.js";
import { RemainingUnmatchedErrors } from "./error-pattern-matcher.js";

describe("Error Pattern Matcher Utils", () => {
    it("should correctly infer the matched errors", () => {
        const ErrorA = createTaggedError("ErrorA");
        type ErrorA = ReturnType<typeof ErrorA>;
        const ErrorB = createTaggedError("ErrorB");
        type ErrorB = ReturnType<typeof ErrorB>;

        const patternMatcher = {
            ErrorA: () => "ErrorA",
            // ErrorB: () => "ErrorB",
        };
        type PatternMatcher = typeof patternMatcher;

        type MatchedErrors = RemainingUnmatchedErrors<
            ErrorA | ErrorB,
            PatternMatcher
        >;
    });
});
