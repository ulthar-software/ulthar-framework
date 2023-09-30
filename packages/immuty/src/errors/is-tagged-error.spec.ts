import { isTaggedError } from "./is-tagged-error.js";
import { UnexpectedTaggedError } from "./unexpected-error.js";

describe("is-tagged-error", () => {
    test("given a TaggedError, returns true", () => {
        const error = new UnexpectedTaggedError("foo");

        expect(isTaggedError(error)).toBe(true);
    });

    test("given a non-TaggedError, it returns false", () => {
        expect(isTaggedError(new Error("foo"))).toBe(false);
        expect(isTaggedError({})).toBe(false);
        expect(isTaggedError([])).toBe(false);
        expect(isTaggedError(null)).toBe(false);
        expect(isTaggedError(undefined)).toBe(false);
        expect(isTaggedError(0)).toBe(false);
        expect(isTaggedError("foo")).toBe(false);
    });
});
