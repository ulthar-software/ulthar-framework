import { makeDeepImmutable } from "./make-immutable";

describe("Make Inmutable", () => {
    it("should make an object fully inmutable", () => {
        const obj = {
            foo: "bar",
            baz: {
                biz: ["fiz"],
            },
        };

        const inmutableObj = makeDeepImmutable(obj);

        expect(inmutableObj).not.toBe(obj);

        expect(() => {
            (<any>inmutableObj).foo = "something";
        }).toThrow();

        expect(() => {
            (<any>inmutableObj).baz.biz.push("something");
        }).toThrow();
    });
});
