import { mutateDeep } from "./mutate-deep.js";

describe("mutateDeep", () => {
    test("given an object, it should mutate the object safely and return a mutated deep copy", () => {
        const obj = {
            foo: "bar",
            baz: {
                faz: "bez",
            },
        };
        const mutated = mutateDeep(obj, (o) => {
            o.foo = "biz";
        });

        expect(obj).not.toBe(mutated);
        expect(obj.foo).not.toBe(mutated.foo);
        expect(obj.baz).not.toBe(mutated.baz);
    });
});
