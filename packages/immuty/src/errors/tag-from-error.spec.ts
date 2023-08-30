import { TagFromError } from "./tag-from-error.js";
import { TaggedError } from "./tagged-error.js";

describe("Tag from error", () => {
    test("given an error, when getting the tag, it should return the tag", () => {
        const error = new TaggedError("TestError");
        expect(TagFromError(error)).toBe("TestError");
    });
});
