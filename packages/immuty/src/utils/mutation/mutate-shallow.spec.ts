import { mutateShallow } from "./mutate-shallow.js";

describe("mutateShallow", () => {
    test("given an object, it should mutate the object safely and return a mutated shallow copy", () => {
        const obj = {
            foo: "bar",
            baz: {
                faz: "bez",
            },
        };
        const mutated = mutateShallow(obj, (o) => {
            o.foo = "biz";
        });

        expect(obj).not.toBe(mutated);
        expect(obj.foo).not.toBe(mutated.foo);
        expect(obj.baz).toBe(mutated.baz);
    });
});
