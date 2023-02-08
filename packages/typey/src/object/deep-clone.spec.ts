import { deepClone } from "./deep-clone";

describe("Deep Clone", () => {
    it("should clone a number", () => {
        const original = 42;
        const cloned = deepClone(original);
        expect(cloned).toEqual(original);
    });

    it("should clone a simple object", () => {
        const original = { x: 42 };
        const cloned = deepClone(original);
        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
    });

    it("should clone a simple array", () => {
        const original = [1, 2, 3];
        const cloned = deepClone(original);
        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
    });

    it("should clone an object with an array inside", () => {
        const original = { x: 42, y: [1, 2, 3] };
        const cloned = deepClone(original);

        expect(cloned.y).toEqual(original.y);
        expect(cloned.y).not.toBe(original.y);
    });

    it("should clone a complex object", () => {
        const original = { x: 42, y: [{ foo: "bar" }] };
        const cloned = deepClone(original);

        expect(cloned.y).toEqual(original.y);
        expect(cloned.y[0]).not.toBe(original.y[0]);
    });

    it("should clone a complex object", () => {
        class Test {
            aFunction() {
                return this.name;
            }
            constructor(private name: string) {}
        }
        const original = new Test("A name");
        const cloned = deepClone(original);

        expect(cloned.aFunction).toEqual(original.aFunction);
        expect(cloned instanceof Test).toBe(true);
    });
});
