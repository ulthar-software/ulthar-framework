import { RemainingUnmatchedErrors } from "./error-pattern-matcher.js";
import { TaggedError } from "./tagged-error.js";

describe("Error Pattern Matcher Utils", () => {
    it("should correctly infer the matched errors", () => {
        class ErrorA extends TaggedError<"ErrorA"> {
            constructor() {
                super("ErrorA");
            }
        }
        class ErrorB extends TaggedError<"ErrorB"> {
            constructor() {
                super("ErrorB");
            }
        }

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
