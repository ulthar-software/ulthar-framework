import { Error } from "./errors/error.js";
import { Result } from "./result.js";

class TestError implements Error {
    readonly _name = "TestError";
    readonly message: string;
    constructor() {
        this.message = "TestError";
    }
}

describe("Result", () => {
    test("given a value, it should return true for isValue", () => {
        const result = Result.ok("value");
        expect(result.isOk()).toBe(true);
    });
    test("given an error, it should return true for isError", () => {
        const result = Result.error(new TestError());
        expect(result.isError()).toBe(true);
    });
    test("given a value, it should return false for isError", () => {
        const result = Result.ok("value");
        expect(result.isError()).toBe(false);
    });
    test("given a value, it should return the value for unwrap", () => {
        const result = Result.ok("value");
        expect(result.unwrap()).toBe("value");
    });
    test("given an error, we cannot unwrap the value", () => {
        const result = Result.error(new TestError());
        //@ts-expect-error
        expect(() => result.unwrap()).toThrowError("error"); //this should not compile
    });
    test("given an error, we can unwrap the error", () => {
        const result = Result.error(new TestError());
        expect(result.unwrapError()).toBeInstanceOf(TestError);
    });
});
