import { createRange } from "./create-range.js";

describe("createRange", () => {
    test("given start and end, create an array of numbers that go from start to end", () => {
        expect(createRange(0, 3)).toEqual([0, 1, 2, 3]);
    });
    test("given start, end, and step, create an array of numbers that goes from start, to end increasing by step", () => {
        expect(createRange(0, 20, 2)).toEqual([
            0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
        ]);
    });
    it("given an end that gets skipped by the given step, create an array that contains the last valid value before end", () => {
        expect(createRange(0, 11, 2)).toEqual([0, 2, 4, 6, 8, 10]);
    });
});
