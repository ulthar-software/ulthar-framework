import { ImmutableArray } from "./array.js";

describe("Immutable Array", () => {
    test("Given an array, create an immutable array of it", () => {
        const array = [1, 2, 3];
        const immutable = new ImmutableArray(array);

        expect(immutable).not.toBe(array);
        expect(immutable.length).toEqual(array.length);
        expect(immutable.get(2)).toEqual(array[2]);
        array.push(4);
        expect(immutable.length).toBe(3);
        expect(immutable.length).not.toEqual(array.length);
    });

    test("Given an immutable array, pushing a value returns a new immutable array", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const copy = immutable.push(4);

        expect(immutable).not.toBe(copy);
        expect(immutable.get(0)).toBe(copy.get(0));
        expect(immutable.get(1)).toBe(copy.get(1));
        expect(immutable.get(2)).toBe(copy.get(2));
        expect(immutable.get(3)).not.toBe(copy.get(3));
    });

    test("Given an immutable array, converting it to json returns the plain array", () => {
        const array = [1, 2, 3];
        const immutable = new ImmutableArray(array);

        expect(JSON.stringify(immutable)).toEqual(JSON.stringify(array));
    });

    test("Given an immutable array, converting it to a plain array returns a plain mutable array", () => {
        const array = [1, 2, 3];
        const immutable = new ImmutableArray(array);

        expect(immutable).not.toEqual(array);
        expect(immutable.toPlain()).toEqual(array);
    });

    test("Given an immutable array, setting one element returns a new immutable array (mutation variant)", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const copy = immutable.set(1, (e) => e + 1);

        expect(immutable).not.toBe(copy);
        expect(immutable.get(0)).toBe(copy.get(0));
        expect(immutable.get(1)).not.toBe(copy.get(1));
        expect(immutable.get(2)).toBe(copy.get(2));
        expect(immutable.get(1)).toBe(2);
        expect(copy.get(1)).toBe(3);
    });

    test("Given an immutable array, setting one element returns a new immutable array (element variant)", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const copy = immutable.set(1, 3);

        expect(immutable).not.toBe(copy);
        expect(immutable.get(0)).toBe(copy.get(0));
        expect(immutable.get(1)).not.toBe(copy.get(1));
        expect(immutable.get(2)).toBe(copy.get(2));
        expect(immutable.get(1)).toBe(2);
        expect(copy.get(1)).toBe(3);
    });

    test("Given an immutable array, mapping it returns a new immutable array", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const copy = immutable.map((e) => e + 1);

        expect(immutable).not.toBe(copy);
        expect(immutable.get(0)).toBe(1);
        expect(immutable.get(1)).toBe(2);
        expect(immutable.get(2)).toBe(3);
        expect(copy.get(0)).toBe(2);
        expect(copy.get(1)).toBe(3);
        expect(copy.get(2)).toBe(4);
    });

    test("Given an immutable array, filtering it returns a new immutable array", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const copy = immutable.filter((e) => e % 2 === 0);

        expect(immutable).not.toBe(copy);
        expect(immutable.get(0)).toBe(1);
        expect(immutable.get(1)).toBe(2);
        expect(immutable.get(2)).toBe(3);
        expect(copy.get(0)).toBe(2);
        expect(copy.length).toBe(1);
    });

    test("Given an immutable array, is empty returns true if the array is empty and false otherwise", () => {
        const empty = new ImmutableArray([]);
        const notEmpty = new ImmutableArray([1, 2, 3]);

        expect(empty.isEmpty()).toBe(true);
        expect(notEmpty.isEmpty()).toBe(false);
    });

    test("Given an immutable array, reducing it returns the expected result", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const result = immutable.reduce((acc, e) => acc + e, 0);

        expect(immutable.get(0)).toBe(1);
        expect(immutable.get(1)).toBe(2);
        expect(immutable.get(2)).toBe(3);
        expect(result).toBe(6);
    });

    test("Given an immutable array, finding an element returns the expected result", () => {
        const immutable = new ImmutableArray([1, 2, 3]);
        const result = immutable.find((e) => e === 2);

        expect(immutable.get(0)).toBe(1);
        expect(immutable.get(1)).toBe(2);
        expect(immutable.get(2)).toBe(3);
        expect(result).toBe(2);
    });
});
