import { TaggedError, createTaggedError } from "../errors/index.js";
import { ErrorResult } from "./error-result.js";
import { Result } from "./result.js";

const TestError = createTaggedError("TestError");

describe("Result", () => {
    test("given a value, when checking isOk and isError, it should return true and false respectively", () => {
        const result = Result.ok("value");
        expect(result.isOk()).toBe(true);
        expect(result.isError()).toBe(false);
    });
    test("given an error, when checking isError and isOk, it should return true and false respectively", () => {
        const result = Result.error(TestError());
        expect(result.isError()).toBe(true);
        expect(result.isOk()).toBe(false);
    });
    test("given a value, when unwrapping, it should return the value", () => {
        const result = Result.ok("value");
        if (result.isError()) throw new Error("Expected a value");
        expect(result.unwrap()).toBe("value");
    });
    test("given an error, when trying to unwrap the value, it should not compile", () => {
        const result = Result.error(TestError());
        //@ts-expect-error
        expect(() => result.unwrap()).toThrowError(
            "result.unwrap is not a function"
        ); //this should not compile
    });
    test("given an error, we can unwrap the error", () => {
        const result = Result.error(TestError());
        if (result.isOk()) throw new Error("Expected an error");
        expect(result.unwrapError()).toEqual(TestError());
    });

    test("given a value, when mapping, it should work", () => {
        const result = Result.ok("value");
        const mappedResult = result.map((value) => value.length);
        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe(5);
    });

    test("given an error, when trying to map, the original error should remain", () => {
        const result = Result.error(TestError()) as Result<
            string,
            TaggedError<"TestError">
        >;
        const mappedResult = result.map((value) => value.length);
        if (mappedResult.isOk()) throw new Error("Expected an error");
        expect(mappedResult.unwrapError()._tag).toBe("TestError");
    });

    test("given a value, when async mapping, it should work", async () => {
        const result = Result.ok("value");
        const mappedResult = await result.asyncMap(
            async (value) => value.length
        );
        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe(5);
    });

    test("given an error, when trying to async map, the original error should remain", async () => {
        const result = Result.error(TestError()) as Result<
            string,
            TaggedError<"TestError">
        >;
        const mappedResult = await result.asyncMap(
            async (value) => value.length
        );
        if (!mappedResult.isError()) throw new Error("Expected an error");
        expect(mappedResult.unwrapError()._tag).toBe("TestError");
    });

    test("given a value, when flat mapping, it should work", () => {
        const result = Result.ok("value");
        const mappedResult = result.flatMap((value) => Result.ok(value.length));
        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe(5);
    });

    test("given an error, when trying to flat map, the original error should remain", () => {
        const result = Result.error(TestError()) as Result<
            string,
            TaggedError<"TestError">
        >;
        const mappedResult = result.flatMap((value) => Result.ok(value.length));
        if (mappedResult.isOk()) throw new Error("Expected an error");
        expect(mappedResult.unwrapError()._tag).toBe("TestError");
    });

    test("given a value, when async flat mapping, it should work", async () => {
        const result = Result.ok("value");
        const mappedResult = await result.asyncFlatMap(async (value) =>
            Result.ok(value.length)
        );
        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe(5);
    });

    test("given an error, when trying to async flat map, the original error should remain", async () => {
        const result = Result.error(TestError()) as Result<
            string,
            TaggedError<"TestError">
        >;
        const mappedResult = await result.asyncFlatMap(async (value) =>
            Result.ok(value.length)
        );
        if (mappedResult.isOk()) throw new Error("Expected an error");
        expect(mappedResult.unwrapError()._tag).toBe("TestError");
    });

    test("given a value, when folding, it should work", () => {
        const result = Result.ok("value");
        const foldedResult = result.fold({
            onSuccess: (value) => value.length,
            onFailure: () => 0,
        });
        if (foldedResult.isError()) throw new Error("Expected a value");
        expect(foldedResult.unwrap()).toBe(5);
    });

    test("given an error, when trying to fold, it should work", () => {
        const result = Result.error(TestError()) as Result<
            string,
            TaggedError<"TestError">
        >;
        const foldedResult = result.fold({
            onSuccess: (value) => value.length,
            onFailure: () => 0,
        });
        if (foldedResult.isError()) throw new Error("Expected a value");
        expect(foldedResult.unwrap()).toBe(0);
    });

    test("given a value, when async folding, it should work", async () => {
        const result = Result.ok("value");
        const foldedResult = await result.asyncFold({
            onSuccess: async (value) => value.length,
            onFailure: async () => 0,
        });
        if (foldedResult.isError()) throw new Error("Expected a value");
        expect(foldedResult.unwrap()).toBe(5);
    });

    test("given an error, when trying to async fold, it should work", async () => {
        const result = Result.error(TestError()) as Result<
            string,
            TaggedError<"TestError">
        >;
        const foldedResult = await result.asyncFold({
            onSuccess: async (value) => value.length,
            onFailure: async () => 0,
        });
        if (foldedResult.isError()) throw new Error("Expected a value");
        expect(foldedResult.unwrap()).toBe(0);
    });

    it("should catch some errors and correctly infer the result type", async () => {
        const TestErrorA = createTaggedError("TestErrorA");
        const resultA = Result.error(TestErrorA()) as Result<
            string,
            TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
        >;

        const foldedResult = resultA.catchSome({
            TestErrorA: () => "default value",
        });

        // foldedResult is correctly inferred as Result<string, TaggedError<"TestErrorB">>
        // as we have caught the TestErrorA but not the TestErrorB

        if (foldedResult.isError()) throw new Error("Expected a value");

        expect(foldedResult.unwrap()).toBe("default value");
    });

    it("should try to catch some errors but continue as an error if the error is not caught", async () => {
        const TestErrorA = createTaggedError("TestErrorA");
        const resultA = Result.error(TestErrorA()) as Result<
            string,
            TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
        >;

        const foldedResult = resultA.catchSome({
            TestErrorB: () => "default value",
        });

        // foldedResult is correctly inferred as Result<string, TaggedError<"TestErrorA">>
        // as we have not caught the TestErrorA

        if (foldedResult.isOk()) throw new Error("Expected an error");

        expect(foldedResult.unwrapError()._tag).toBe("TestErrorA");
    });

    it("should skip the catchSome if the result is ok", async () => {
        const resultA = Result.ok("original value") as Result<
            string,
            TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
        >;

        const foldedResult = resultA.catchSome({
            TestErrorA: () => "default value",
        });

        // foldedResult is correctly inferred as Result<string, TaggedError<"TestErrorB">>
        // as we have caught TestErrorA

        if (foldedResult.isError()) throw new Error("Expected a value");

        expect(foldedResult.unwrap()).toBe("original value");
    });

    it("should catch all errors if there is an error", async () => {
        const TestErrorA = createTaggedError("TestErrorA");
        const resultA = Result.error(TestErrorA()) as Result<
            string,
            TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
        >;

        const foldedResult = resultA.catchAll({
            TestErrorA: () => "default value",
            TestErrorB: () => "default value",
        });

        if (foldedResult.isError()) throw new Error("Expected a value");

        expect(foldedResult.unwrap()).toBe("default value");
    });

    it("should skip catchAll if the result is ok", async () => {
        const resultA = Result.ok("original value") as Result<
            string,
            TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
        >;

        const foldedResult = resultA.catchAll({
            TestErrorA: () => "default value",
            TestErrorB: () => "default value",
        });

        if (foldedResult.isError()) throw new Error("Expected a value");

        expect(foldedResult.unwrap()).toBe("original value");
    });
});
