import { isEmptyObject } from "./is-empty-object";

describe("Is empty object", () => {
    it("should return correctly on an object with fields", () => {
        expect(
            isEmptyObject({
                foo: "bar",
            })
        ).toBe(false);
    });
    it("should return correctly on an object without fields", () => {
        expect(isEmptyObject({})).toBe(true);
    });
});
