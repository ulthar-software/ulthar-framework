import { equals } from "./equals.js";

describe("Equals", () => {
    test("Given two equal objects, should return true", () => {
        const obj1 = { foo: "bar" };
        const obj2 = { foo: "bar" };
        expect(equals(obj1, obj2)).toBe(true);
    });
    test("Given two different objects, should return false", () => {
        const obj1 = { foo: "bar" };
        const obj2 = { bar: "foo" };
        expect(equals(obj1, obj2)).toBe(false);
    });
    test("Given an array and an object, should return false", () => {
        const obj1 = { foo: "bar" };
        const obj2 = ["bar", "foo"];
        expect(equals(obj1, obj2)).toBe(false);
    });
    test("Given an object and a number, should return false", () => {
        const obj1 = { foo: "bar" };
        const obj2 = 5;
        expect(equals(obj1, obj2)).toBe(false);
    });
});
