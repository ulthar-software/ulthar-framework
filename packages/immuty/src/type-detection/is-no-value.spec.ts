import { isNoValue } from "./is-no-value.js";

describe("Is No Value", () => {
    test("Given a value, should return false", () => {
        expect(isNoValue(1)).toBe(false);
    });
    test("Given a value, should return false", () => {
        expect(isNoValue({ foo: "bar" })).toBe(false);
    });
    test("Given null, should return true", () => {
        expect(isNoValue(null)).toBe(true);
    });
    test("Given undefined, should return true", () => {
        expect(isNoValue(undefined)).toBe(true);
    });
    test("Given NaN, should return true", () => {
        expect(isNoValue(NaN)).toBe(true);
    });
});
