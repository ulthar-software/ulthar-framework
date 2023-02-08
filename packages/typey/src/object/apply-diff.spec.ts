import { applyDiff } from "./apply-diff";
import { IObjectDiff, objectDiff } from "./object-diff";

describe("Apply Diff", () => {
    it("should correctly perform changes given an object and a diff", () => {
        const obj1 = {
            foo: "bar",
            baz: "foo",
            fiz: { banana: "pineapple", bar: "foo" },
        };
        const obj1ToString = JSON.stringify(obj1);
        const obj2 = {
            foo: "buzz",
            biz: "bir",
            fiz: { banana: "melon" },
        };
        const diff = objectDiff(obj1, obj2 as any);

        expect(applyDiff(obj1, diff as IObjectDiff<any>)).toEqual(obj2);

        expect(obj1ToString).toEqual(JSON.stringify(obj1)); //original object shouldn't have mutated
    });
});
