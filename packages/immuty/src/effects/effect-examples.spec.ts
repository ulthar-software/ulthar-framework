import { createNativeErrorWrapperWith } from "../errors/create-native-error-wrapper.js";
import { Effect, Result, createTaggedError } from "../index.js";

describe("Effect Examples", () => {
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
