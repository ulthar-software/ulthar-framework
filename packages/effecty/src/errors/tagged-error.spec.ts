import { TaggedError } from "./tagged-error.js";
import { customTaggedError } from "./custom-tagged-error.js";

describe("Tagged Error", () => {
    test("Given a TaggedError, when toString is called, then it should return a string with the tag and the native error", () => {
        const nativeError = new Error("Native Error");
        const taggedError = new TaggedError("Tag", nativeError);
        const result = taggedError.toString();
        expect(result).toEqual(`[Tag] ${nativeError.stack}`);
    });

    test("Given a TaggedError created with a message, when toString is called, then it should return a string with the tag and the native error", () => {
        const message = "Some Error";
        const taggedError = new TaggedError("Tag", message);
        const result = taggedError.toString();
        expect(result).toEqual(`[Tag] ${taggedError.nativeError.stack}`);
    });

    test("Given a TaggedError without a message, when toString is called, then it should return a string with the tag and the native error", () => {
        const taggedError = new TaggedError("Tag");
        const result = taggedError.toString();
        expect(result).toEqual(`[Tag] ${taggedError.nativeError.stack}`);
    });

    test("Given a TaggedError with params, when toString is called, then it should return a string with the tag, the params and the native error", () => {
        const nativeError = new Error("Native Error");
        const taggedError = new TaggedError("Tag", nativeError);
        const result = taggedError.toString({ foo: "bar" });
        expect(result).toEqual(`[Tag] {"foo":"bar"} ${nativeError.stack}`);
    });

    test("Given a new custom TaggedError, it should be able to declare params", () => {
        const CustomTaggedError = customTaggedError(
            "CustomTag",
            (foo: string) => ({ foo })
        );

        const taggedError = new CustomTaggedError("bar");
        const result = taggedError.toString();

        expect(result).toEqual(
            `[CustomTag] {"foo":"bar"} ${taggedError.nativeError.stack}`
        );
    });

    test("Given a new custom TaggedError, it should be able to declare a custom message", () => {
        const CustomTaggedError = customTaggedError(
            "CustomTag",
            (foo: string) => ({ foo }),
            ({ foo }) => `Custom message: ${foo}`
        );

        const taggedError = new CustomTaggedError("bar");
        const result = taggedError.toString();

        expect(result).toEqual(`[CustomTag] Custom message: bar`);
    });
});
