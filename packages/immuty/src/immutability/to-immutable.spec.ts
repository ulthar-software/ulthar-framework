import { toDeepImmutable } from "./to-immutable.js";

describe("To Inmutable", () => {
    it("should make an object fully readonly", () => {
        const obj = {
            foo: "bar",
            baz: {
                biz: ["fiz"],
            },
        };

        const readonlyObj = toDeepImmutable(obj);

        expect(readonlyObj).not.toBe(obj);

        expect(() => {
            (<any>readonlyObj).foo = "something";
        }).toThrow();

        expect(() => {
            (<any>readonlyObj).baz.biz.push("something");
        }).toThrow();
    });
});
