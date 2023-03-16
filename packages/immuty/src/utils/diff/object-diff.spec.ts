import { objectDiff } from "./object-diff";

describe("Object Diff", () => {
    it("should return empty diff given two empty objects", () => {
        const obj1 = {};
        const obj2 = {};
        expect(objectDiff(obj1, obj2)).toEqual({
            createdProps: {},
            updatedProps: {},
            deletedProps: {},
        });
    });

    it("should return value given two non objects", () => {
        const obj1 = "something";
        const obj2 = "another";
        expect(objectDiff(obj1 as any, obj2 as any)).toEqual({
            oldValue: "something",
            newValue: "another",
        });
    });

    it("should return empty object given two equal non-objects", () => {
        const obj1 = "something";
        const obj2 = "something";
        expect(objectDiff(obj1 as any, obj2 as any)).toEqual(undefined);
    });

    it("should return correct createdProperties given two objects", () => {
        const obj1 = { foo: "bar" };
        const obj2 = { foo: "bar", fiz: "buzz" };
        expect(objectDiff(obj1, obj2)).toEqual({
            createdProps: { fiz: "buzz" },
            updatedProps: {},
            deletedProps: {},
        });
    });
    it("should return correct deletedProperties given two objects", () => {
        const obj1 = { foo: "bar", fiz: "buzz" };
        const obj2 = { foo: "bar" };
        expect(objectDiff(obj1, obj2)).toEqual({
            createdProps: {},
            updatedProps: {},
            deletedProps: { fiz: "buzz" },
        });
    });

    it("should return correct updatedProperties given two objects", () => {
        const obj1 = { foo: "bar" };
        const obj2 = { foo: "buzz" };
        expect(objectDiff(obj1, obj2)).toEqual({
            createdProps: {},
            updatedProps: {
                foo: {
                    oldValue: "bar",
                    newValue: "buzz",
                },
            },
            deletedProps: {},
        });
    });

    it("should support nested objects", () => {
        const obj1 = {
            foo: "bar",
            baz: "foo",
            changedDate: new Date(),
            sameDate: new Date(),
            fiz: { banana: "pineapple", bar: "foo" },
        };
        const obj2 = {
            foo: "buzz",
            biz: "bir",
            changedDate: new Date(1990, 1),
            sameDate: new Date(),
            fiz: { banana: "melon" },
        };

        expect(objectDiff(obj1, obj2 as any)).toEqual({
            createdProps: {
                biz: "bir",
            },
            updatedProps: {
                changedDate: {
                    newValue: obj2.changedDate,
                    oldValue: obj1.changedDate,
                },
                fiz: {
                    createdProps: {},
                    deletedProps: { bar: "foo" },
                    updatedProps: {
                        banana: {
                            newValue: "melon",
                            oldValue: "pineapple",
                        },
                    },
                },
                foo: {
                    newValue: "buzz",
                    oldValue: "bar",
                },
            },
            deletedProps: {
                baz: "foo",
            },
        });
    });
});
