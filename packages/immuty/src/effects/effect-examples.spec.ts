import { Effect, Result, TaggedError } from "../index.js";

describe("Effect Examples", () => {
    it("should work for a readFile-like situation", async () => {
        function mockReadFile(path: string): Promise<string> {
            if (path != "path_that_exists") {
                return Promise.reject(new Error("file not found"));
            }
            return Promise.resolve("Some Content");
        }

        class FileNotFoundError extends TaggedError<"FileNotFoundError"> {
            constructor(e: unknown) {
                super("FileNotFoundError", e as Error);
            }
        }

        function effectfullReadFile(path: string) {
            return Effect.fromPromise(
                () => mockReadFile(path),
                (e) => new FileNotFoundError(e)
            );
        }

        const okResult = await effectfullReadFile("path_that_exists").run();
        expect(okResult).toEqual(Result.ok("Some Content"));

        const errResult = await effectfullReadFile(
            "path_that_doesn't_exists"
        ).run();
        expect(errResult).toEqual(
            Result.error(new FileNotFoundError(new Error("file not found")))
        );
    });
});
