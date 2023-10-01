import {
    UnexpectedTaggedError,
    wrapUnexpectedError,
} from "./unexpected-error.js";

describe("Unexpected Error", () => {
    test("The default error should be UnexpectedError", () => {
        const error = new Error();

        expect(wrapUnexpectedError(error)).toEqual(
            new UnexpectedTaggedError(error)
        );
    });
});
