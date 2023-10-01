import { isVariant } from "./is-variant.js";

describe("is-variant", () => {
    test("given a variant type, it should properly return true", () => {
        const Test = {
            _tag: "Foo",
            foo: "bar",
        } as const;

        expect(isVariant(Test)).toEqual(true);
    });

    test("given a non variant type, it should properly return false", () => {
        const Test = {
            foo: "bar",
        } as const;

        expect(isVariant(Test)).toEqual(false);
    });
});
