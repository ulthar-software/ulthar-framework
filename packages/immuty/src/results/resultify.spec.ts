import { TaggedError, wrapUnexpectedError } from "../index.js";
import { Result } from "../result.js";
import { resultify } from "./resultify.js";

describe("resultify", () => {
    test("given a simple function, it generates a resultified version", () => {
        const fn = (num: number) => num * num;

        const resultified = resultify(fn);

        expect(resultified(5)).toEqual(Result.ok(25));
    });

    test("given a function that already returns a result, it generates the same fn", () => {
        const fn = (num: number) => Result.ok(num * num);

        const resultified = resultify(fn);

        expect(resultified(5)).toEqual(Result.ok(25));
    });

    test("given a function that throws, it generates a reliable function that returns a Result error", () => {
        const fn = (num: number): number => {
            throw new Error("foo");
        };

        const resultified = resultify(fn);

        expect(resultified(5)).toEqual(
            Result.error(wrapUnexpectedError(new Error("foo")))
        );
    });

    test("given an async function that throws, it generates a reliable function that returns an AsyncResult that resolves to a Result error", async () => {
        const fn = async (num: number): Promise<number> => {
            throw new Error("foo");
        };

        const resultified = resultify(fn);

        expect(await resultified(5).resolve()).toEqual(
            Result.error(wrapUnexpectedError(new Error("foo")))
        );
    });

    test("given an async function that returns a result, it generates a new function that returns an AsyncResult", async () => {
        const fn = async (num: number) => Result.ok(num * num);

        const resultified = resultify(fn);

        expect(await resultified(5).resolve()).toEqual(Result.ok(25));
    });

    test("given a function that returns some values or a tagged error, it generates a resultified version with those types", () => {
        const fn = (num: number) => {
            if (num < 0) {
                return new TaggedError("NEGATIVE_NUMBER");
            }
            return num * num;
        };

        const resultified = resultify(fn);

        expect(resultified(5)).toEqual(Result.ok(25));
        expect(resultified(-1)).toEqual(
            Result.error(new TaggedError("NEGATIVE_NUMBER"))
        );
    });

    test("given an async function that returns some values or a tagged error, it generates a resultified that returns an AsyncResult with those types", async () => {
        const fn = async (num: number) => {
            if (num < 0) {
                return new TaggedError("NEGATIVE_NUMBER");
            }
            return num * num;
        };

        const resultified = resultify(fn);

        expect(await resultified(5).resolve()).toEqual(Result.ok(25));
        expect(await resultified(-1).resolve()).toEqual(
            Result.error(new TaggedError("NEGATIVE_NUMBER"))
        );
    });
});
