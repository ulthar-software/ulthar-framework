import { isDateObject } from "./is-date-object.js";

describe("isDate", () => {
    test("Given a date, it should return true", () => {
        expect(isDateObject(new Date())).toBe(true);
    });
    test("Given anything other than a date, it should return false", () => {
        expect(isDateObject({})).toBe(false);
        expect(isDateObject("hello world")).toBe(false);
        expect(isDateObject("02-12-1990")).toBe(false);
        expect(isDateObject([2, 12, 1990])).toBe(false);
        expect(isDateObject(5)).toBe(false);
    });
});
