import { createNativeErrorWrapperWith } from "../errors/create-native-error-wrapper.js";
import { Result, createTaggedError, defaultErrorWrapper } from "../index.js";
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
            Result.error(defaultErrorWrapper(new Error("error")))
        );
    });

    it("should provide a way to catch custom errors", async () => {
        const TestError = createTaggedError("TestError");
        const errorWrapper = createNativeErrorWrapperWith(TestError);

        const effectFn = effectFromPromise(async (deps: { a: number }) => {
            throw new Error("error");
        }, errorWrapper);

        const result = await effectFn({ a: 1 });

        expect(result).toEqual(Result.error(errorWrapper(new Error("error"))));
    });
});
