import { mergeObjectArray } from "./merge-obj-array";

describe("Merge object array", () => {
    it("should handle two arrays", () => {
        expect(
            mergeObjectArray(
                [
                    [{ value: 1 }, { value: 3 }, { value: 6 }],
                    [{ value: 2 }, { value: 4 }, { value: 5 }],
                ],
                (o1, o2) => o1.value < o2.value
            )
        ).toEqual([
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
            { value: 6 },
        ]);
    });

    it("should handle different size arrays", () => {
        expect(
            mergeObjectArray(
                [
                    [{ value: 1 }, { value: 6 }, { value: 8 }, { value: 12 }],
                    [{ value: 2 }, { value: 5 }, { value: 7 }],
                    [
                        { value: 3 },
                        { value: 4 },
                        { value: 9 },
                        { value: 10 },
                        { value: 11 },
                    ],
                ],
                (o1, o2) => o1.value < o2.value
            )
        ).toEqual([
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
            { value: 6 },
            { value: 7 },
            { value: 8 },
            { value: 9 },
            { value: 10 },
            { value: 11 },
            { value: 12 },
        ]);
    });
});
