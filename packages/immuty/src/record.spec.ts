import { ImmutableRecord } from "./record.js";

describe("Immutable Record", () => {
    test("Given an plain object, create an immutable record of it", () => {
        const plainObj = {
            foo: "bar",
        };

        const immutable = new ImmutableRecord(plainObj);
        const copy = immutable.shallowMutate((o) => (o.foo = "baz"));

        expect(immutable.get("foo")).not.toBe(copy.get("foo"));
        expect(immutable).not.toBe(copy);
    });

    test("Given an immutable record, setting a property returns a new immutable record", () => {
        const immutable = new ImmutableRecord({
            foo: "bar",
        });
        const copy = immutable.set("foo", "baz");

        expect(immutable.get("foo")).not.toBe(copy.get("foo"));
        expect(immutable).not.toBe(copy);
    });

    test("Given an immutable record, converting it to json returns the plain record", () => {
        const plainObj = {
            foo: "bar",
        };
        const immutable = new ImmutableRecord(plainObj);

        expect(JSON.stringify(immutable)).toEqual(JSON.stringify(plainObj));
    });

    test("Given an immutable record, converting it to a plain object returns a plain mutable record", () => {
        const plainObj = {
            foo: "bar",
        };
        const immutable = new ImmutableRecord(plainObj);

        expect(immutable).not.toEqual(plainObj);
        expect(immutable.asMutable()).toEqual(plainObj);
    });

    test("Given an immutable record, making a deep mutation returns a new immutable record", () => {
        const immutable = new ImmutableRecord({
            foo: {
                bar: "baz",
            },
        });
        const copy = immutable.deepMutate((o) => (o.foo.bar = "qux"));

        expect(immutable.get("foo").bar).not.toBe(copy.get("foo").bar);
        expect(immutable.get("foo")).not.toBe(copy.get("foo"));
        expect(immutable).not.toBe(copy);
    });
});
