import { UnexpectedError, defaultErrorWrapper } from "./unexpected-error.js";

describe("Unexpected Error", () => {
    test("The default error should be UnexpectedError", () => {
        const error = new Error();

        expect(defaultErrorWrapper(error)).toEqual(UnexpectedError(error));
    });
});
