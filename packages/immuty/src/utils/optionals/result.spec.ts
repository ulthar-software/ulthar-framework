import { Result } from "./result.js";

describe("Result", () => {
    test("Given a value, create a result of it and be able to pattern match", () => {
        const result = Result.of(1);
        result.match({
            just: (value) => expect(value).toBe(1),
            err: () => fail("Should not be an error"),
        });
    });

    test("Given a null value, create a result of it and be able to pattern match", () => {
        const errResult = Result.err("Test error");
        errResult.match({
            just: (value) => fail("Should not be a value"),
            err: (err) => expect(err).toEqual("Test error"),
        });
    });
});
