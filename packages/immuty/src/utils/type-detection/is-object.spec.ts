import { isObject } from "./is-object.js";

describe("Is Object", () => {
    test.each([
        [{}, true],
        [[], true],
        [new Date(), true],
        [null, false],
        [undefined, false],
        [NaN, false],
        [1, false],
        ["hello world", false],
    ])("Given %p, should return %p", (value, expected) => {
        expect(isObject(value)).toBe(expected);
    });
});
