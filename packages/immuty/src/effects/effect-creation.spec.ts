import { Result, TaggedError, wrapUnexpectedError } from "../index.js";
import { Effect } from "./effect.js";

describe("Effect Creation", () => {
    it("should create an effect from a promise", async () => {
        const effect = Effect.from(async (deps: { a: number }) => {
            return Result.ok(deps.a);
        });
        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should create an effect from a promise and handle errors by default", async () => {
        const effect = Effect.from(
            Result.wrap(async (deps: { a: number }) => {
                throw new Error("error");
            })
        );
        const result = await effect.run({ a: 1 }); //the type says that it should never fail, but it is an "unexpected error"

        expect(result).toEqual(
            Result.error(wrapUnexpectedError(new Error("error")))
        );
    });

    it("should create an effect from a promise and handle errors with a custom error wrapper", async () => {
        class TestError extends TaggedError<"TestError"> {
            constructor(e: unknown) {
                super("TestError", e as Error);
            }
        }

        const effect = Effect.from(async (deps: { a: number }) => {
            return Result.error(new TestError("error"));
        });

        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.error(new TestError(new Error("error"))));
    });

    it("should create an effect from a sync function", async () => {
        const effect = Effect.from((deps: { a: number }) => {
            return Result.ok(deps.a);
        });
        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should create an effect from an effect fn", async () => {
        const effect = Effect.from(async (deps: { a: number }) => {
            return Result.ok(deps.a);
        });
        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });
});
