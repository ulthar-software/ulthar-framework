import { TaggedError, customTaggedError } from "../index.js";
import { Result } from "./result.js";
import { resultify } from "./resultify.js";

const TestErrorA = customTaggedError("TestErrorA");
const TestErrorB = customTaggedError("TestErrorB");

describe("Result", () => {
    describe("Creation", () => {
        test("Given a value, when checking isOk and isError, it should return true and false respectively", () => {
            const result = Result.ok("value");
            expect(result.isOk()).toBe(true);
            expect(result.isError()).toBe(false);
        });
        test("Given an error, when checking isError and isOk, it should return true and false respectively", () => {
            const result = Result.error(new TestErrorA());
            expect(result.isError()).toBe(true);
            expect(result.isOk()).toBe(false);
        });
    });

    describe("Unwrapping", () => {
        test("Given an okResult, when unwrapping, it should return the value", () => {
            const result = Result.ok("value");
            if (result.isError()) throw new Error("Expected a value");
            expect(result.unwrap()).toBe("value");
        });
        test("Given an errorResult, when trying to unwrap the value, it should not compile", () => {
            const result = Result.error(new TestErrorA());
            //@ts-expect-error: this next line should not compile as result is not an OkResult
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            expect(() => result.unwrap()).toThrowError(
                "result.unwrap is not a function"
            );
        });
        test("Given an errorResult, we can unwrap the error", () => {
            const result = Result.error(new TestErrorA());
            if (result.isOk()) throw new Error("Expected an error");
            expect(result.unwrapError()).toEqual(new TestErrorA());
        });
    });

    describe("Composition", () => {
        test("Given an okResult, when mapping, it should work", () => {
            const result = Result.ok("value");
            const mappedResult = result.map((value) => value.length);
            if (mappedResult.isError()) throw new Error("Expected a value");
            expect(mappedResult.unwrap()).toBe(5);
        });

        test("Given an errorResult, when trying to map, the original error should remain", () => {
            const result = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA">
            >;
            const mappedResult = result.map((value) => value.length);
            if (mappedResult.isOk()) throw new Error("Expected an error");
            expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
        });

        test("Given an okResult, when async mapping, it should work", async () => {
            const result = Result.ok("value");
            const mappedResult = await result
                .asyncMap(async (value) => value.length)
                .resolve();
            if (mappedResult.isError()) throw new Error("Expected a value");
            expect(mappedResult.unwrap()).toBe(5);
        });

        test("Given an errorResult, when trying to async map, the original error should remain", async () => {
            const result = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA">
            >;
            const mappedResult = await result
                .asyncMap(async (value) => value.length)
                .resolve();
            if (!mappedResult.isError()) throw new Error("Expected an error");
            expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
        });

        test("Given an errorResult, when trying multiple async maps, the original error should remain", async () => {
            const result = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA">
            >;
            const mappedResult = await result
                .asyncMap(async (value) => value.length)
                .asyncMap(async (value) => value + 1)
                .asyncMap(async (value) => value + 1)
                .asyncMap(async (value) => value + 1)
                .resolve();
            if (!mappedResult.isError()) throw new Error("Expected an error");
            expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
        });

        test("Given an okResult, when flat mapping, it should work", () => {
            const result = Result.ok("value");
            const mappedResult = result.flatMap((value) =>
                Result.ok(value.length)
            );
            if (mappedResult.isError()) throw new Error("Expected a value");
            expect(mappedResult.unwrap()).toBe(5);
        });

        test("Given an errorResult, when trying to flat map, the original error should remain", () => {
            const result = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA">
            >;
            const mappedResult = result.flatMap((value) =>
                Result.ok(value.length)
            );
            if (mappedResult.isOk()) throw new Error("Expected an error");
            expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
        });

        test("Given an okResult, when async flat mapping, it should work", async () => {
            const result = Result.ok("value");
            const mappedResult = await result
                .asyncFlatMap(async (value) => Result.ok(value.length))
                .resolve();
            if (mappedResult.isError()) throw new Error("Expected a value");
            expect(mappedResult.unwrap()).toBe(5);
        });

        test("Given an errorResult, when trying to async flat map, the original error should remain", async () => {
            const result = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA">
            >;
            const mappedResult = await result
                .asyncFlatMap(async (value) => Result.ok(value.length))
                .resolve();

            if (mappedResult.isOk()) throw new Error("Expected an error");
            expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
        });

        test("Given an okResult, when async result mapping, it should work", async () => {
            const result = Result.ok("value");
            const mappedResult = await result
                .asyncResultMap(resultify(async (value) => value.length))
                .resolve();
            if (mappedResult.isError()) throw new Error("Expected a value");
            expect(mappedResult.unwrap()).toBe(5);
        });

        test("Given an errorResult, when async result mapping, the original error should remain", async () => {
            const result = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA">
            >;
            const mappedResult = await result
                .asyncResultMap(resultify(async (value) => value.length))
                .resolve();

            if (mappedResult.isOk()) throw new Error("Expected an error");
            expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
        });
    });

    describe("Error handling", () => {
        test("Given a result, catchSome works and correctly infers the new result type", async () => {
            const TestErrorA = customTaggedError("TestErrorA");

            const resultA = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            >;

            const foldedResult = resultA.catchSome({
                TestErrorA: resultify(() => "default value"),
            });

            // foldedResult is correctly inferred as Result<string, TaggedError<"TestErrorB">>
            // as we have caught the TestErrorA but not the TestErrorB

            if (foldedResult.isError()) throw new Error("Expected a value");

            expect(foldedResult.unwrap()).toBe("default value");
        });

        test("Given a result with catchSome that doesn't catch the running error it should continue unfolded", async () => {
            const resultA = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            >;

            const foldedResult = resultA.catchSome({
                TestErrorB: resultify(() => "default value"),
            });

            // foldedResult is correctly inferred as Result<string, TaggedError<"TestErrorA">>
            // as we have not caught the TestErrorA

            if (foldedResult.isOk()) throw new Error("Expected an error");

            expect(foldedResult.unwrapError()._tag).toBe("TestErrorA");
        });

        test("Given an okResult, the catchSome operation is ignored", async () => {
            const resultA = Result.ok("original value") as Result<
                string,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            >;

            const foldedResult = resultA.catchSome({
                TestErrorA: resultify(() => "default value"),
            });

            // foldedResult is correctly inferred as Result<string, TaggedError<"TestErrorB">>
            // as we have caught TestErrorA

            if (foldedResult.isError()) throw new Error("Expected a value");

            expect(foldedResult.unwrap()).toBe("original value");
        });

        test("Given a result, catchAll catches all possible errors and correctly infer the new result type", async () => {
            const resultA = Result.error(new TestErrorA()) as Result<
                string,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            >;

            const foldedResult = resultA.catchAll({
                TestErrorA: () => Result.ok("default value"),
                TestErrorB: () => Result.ok("default value"),
            });

            if (foldedResult.isError()) throw new Error("Expected a value");

            expect(foldedResult.unwrap()).toBe("default value");
        });

        test("Given an okResult, the catchAll operation is ignored", async () => {
            const resultA = Result.ok("original value") as Result<
                string,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            >;

            const foldedResult = resultA.catchAll({
                TestErrorA: () => Result.ok("default value"),
                TestErrorB: () => Result.ok("default value"),
            });

            if (foldedResult.isError()) throw new Error("Expected a value");

            expect(foldedResult.unwrap()).toBe("original value");
        });
    });

    describe("Immutability", () => {
        test("Given a result, we cannot mutate its internal value", async () => {
            const result = Result.ok({ foo: "bar" });
            const mappedResult = result.map((v) => {
                // v.foo = "baz"; <- This should not compile
                return {
                    foo: "baz",
                };
            });

            const value = result.unwrap();
            value.foo = "fez";

            if (mappedResult.isError()) fail("Expected a value");
            expect(mappedResult.unwrap()).toEqual({
                foo: "baz",
            });

            if (result.isError()) throw new Error("Expected a value");
            expect(result.unwrap()).toEqual({
                foo: "bar",
            });
        });
    });
});
