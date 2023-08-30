import { Result, TaggedError, wrapUnexpectedError } from "../index.js";
import { effectFromPromise } from "./effect-from-promise.js";

describe("Effect from Promise", () => {
    it("should create an effect from a promise", async () => {
        const effectFn = effectFromPromise(async (deps: { a: number }) => {
            return deps.a;
        });

        const result = await effectFn({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should catch unexpected errors by default", async () => {
        const effectFn = effectFromPromise(async (deps: { a: number }) => {
            throw new Error("error");
        });

        const result = await effectFn({ a: 1 });

        expect(result).toEqual(
            Result.error(wrapUnexpectedError(new Error("error")))
        );
    });

    it("should provide a way to catch custom errors", async () => {
        class TestError extends TaggedError<"TestError"> {
            constructor(e: unknown) {
                super("TestError", e as Error);
            }
        }

        const effectFn = effectFromPromise(
            async (deps: { a: number }) => {
                throw new Error("error");
            },
            (e) => new TestError(e)
        );

        const result = await effectFn({ a: 1 });

        expect(result).toEqual(Result.error(new TestError(new Error("error"))));
    });
});
