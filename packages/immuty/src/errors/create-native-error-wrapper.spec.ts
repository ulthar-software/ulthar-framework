import { createNativeErrorWrapperWith } from "./create-native-error-wrapper.js";
import { createTaggedError } from "./create-tagged-error.js";

describe("Wrap Native With TaggedError", () => {
    const TestError = createTaggedError("TestError");
    it("Should wrap a native error with a tagged error", () => {
        const error = new Error();
        const wrapError = createNativeErrorWrapperWith(TestError);
        expect(wrapError(error)).toEqual(TestError(error));
    });
});
