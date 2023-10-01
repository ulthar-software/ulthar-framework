import { shallowClone } from "./shallow-clone.js";

describe("shallow-clone", () => {
    test("given an object, it should properly clone it", () => {
        const obj = {
            foo: "bar",
        };

        const clone = shallowClone(obj);

        expect(clone).toEqual(obj);
        expect(clone).not.toBe(obj);
    });
    test("given an array, it should properly clone it", () => {
        const arr = ["foo", "bar"];

        const clone = shallowClone(arr);

        expect(clone).toEqual(arr);
        expect(clone).not.toBe(arr);
    });

    test("given a primitive value, it should properly return it", () => {
        const value = "foo";

        const clone = shallowClone(value);

        expect(clone).toEqual(value);
        expect(clone).toBe(value);
    });

    test("given an object that implements the IShallowCloneable interface, it should properly clone it", () => {
        class Test {
            public readonly foo = "bar";

            public shallowClone() {
                return new Test();
            }
        }

        const obj = new Test();

        const clone = shallowClone(obj);

        expect(clone).toEqual(obj);
        expect(clone).not.toBe(obj);
        expect(clone).toBeInstanceOf(Test);
    });
});
