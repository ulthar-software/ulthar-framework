import { createNativeErrorWrapperWith } from "../errors/create-native-error-wrapper.js";
import { Result, createTaggedError, defaultErrorWrapper } from "../index.js";
import { Effect } from "./effect.js";

describe("Effect", () => {
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

    it("should map an effect given a function that maps the result", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect
            .map(async ([value]) => Result.ok(value + 1))
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(2));
    });

    it("should create an effect from a sync function", async () => {
        const effect = Effect.fromSync((deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should flatMap an effect given an effect constructor", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect
            .flatMap((value) => Effect.fromSync(() => value + 1))
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(2));
    });

    it("should work for a readFile-like situation", async () => {
        function mockReadFile(path: string): Promise<string> {
            if (path != "path_that_exists") {
                return Promise.reject(new Error("file not found"));
            }
            return Promise.resolve("Some Content");
        }

        const FileNotFoundError = createTaggedError("FileNotFoundError");
        const readFileErrorWrapper =
            createNativeErrorWrapperWith(FileNotFoundError);

        function effectfullReadFile(path: string) {
            return Effect.fromPromise(
                () => mockReadFile(path),
                readFileErrorWrapper
            );
        }

        const okResult = await effectfullReadFile("path_that_exists").run();
        expect(okResult).toEqual(Result.ok("Some Content"));

        const errResult = await effectfullReadFile(
            "path_that_doesn't_exists"
        ).run();
        expect(errResult).toEqual(
            Result.error(readFileErrorWrapper(new Error("file not found")))
        );
    });
});
