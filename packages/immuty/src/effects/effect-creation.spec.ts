import { createNativeErrorWrapperWith } from "../errors/create-native-error-wrapper.js";
import { Result, createTaggedError, defaultErrorWrapper } from "../index.js";
import { Effect } from "./effect.js";

describe("Effect Creation", () => {
    it("should create an effect from a promise", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should create an effect from a promise and handle errors by default", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            throw new Error("error");
        });
        const result = await effect.run({ a: 1 }); //the type says that it should never fail, but it is an "unexpected error"

        expect(result).toEqual(
            Result.error(defaultErrorWrapper(new Error("error")))
        );
    });

    it("should create an effect from a promise and handle errors with a custom error wrapper", async () => {
        const TestError = createTaggedError("TestError");
        const errorWrapper = createNativeErrorWrapperWith(TestError);

        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            throw new Error("error");
        }, errorWrapper);

        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.error(errorWrapper(new Error("error"))));
    });

    it("should create an effect from a sync function", async () => {
        const effect = Effect.fromSync((deps: { a: number }) => {
            return deps.a;
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
