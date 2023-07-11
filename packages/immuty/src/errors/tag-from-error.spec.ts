import { createTaggedError } from "./create-tagged-error.js";
import { TagFromError } from "./tag-from-error.js";

describe("Tag from error", () => {
    test("given an error, when getting the tag, it should return the tag", () => {
        const error = createTaggedError("TestError")();
        expect(TagFromError(error)).toBe("TestError");
    });
});
