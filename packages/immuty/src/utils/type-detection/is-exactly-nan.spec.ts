import { isExactlyNaN } from "./is-exactly-nan.js";

describe("Is Exactly NaN", () => {
    test("Given a numeric value, should return false", () => {
        expect(isExactlyNaN(1)).toBe(false);
    });
    test("Given an object value, should return false", () => {
        expect(isExactlyNaN({ foo: "bar" })).toBe(false);
    });
    test("Given a string value, should return false", () => {
        expect(isExactlyNaN("hello world")).toBe(false);
    });
    test("Given null, should return false", () => {
        expect(isExactlyNaN(null)).toBe(false);
    });
    test("Given undefined, should return false", () => {
        expect(isExactlyNaN(undefined)).toBe(false);
    });
    test("Given NaN, should return true", () => {
        expect(isExactlyNaN(NaN)).toBe(true);
    });
});
