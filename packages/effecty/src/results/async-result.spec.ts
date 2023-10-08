import { TaggedError, customTaggedError } from "../index.js";
import { Result } from "./result.js";
import { resultify } from "./resultify.js";

const TestErrorA = customTaggedError("TestErrorA");

describe("Async Result", () => {
    test("Given a result that is async mapped, the async result can be correctly mapped", async () => {
        const result = Result.ok("value");
        const mappedResult = await result
            .asyncMap(async (v) => v.length)
            .asyncMap((v) => "Hello" + v)
            .resolve();

        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe("Hello5");
    });

    test("Given a result that is async mapped, the async result can be correctly flat mapped", async () => {
        const result = Result.ok("value");
        const mappedResult = await result
            .asyncMap(async (v) => v.length)
            .asyncFlatMap((v) => Result.ok("Hello" + v))
            .resolve();

        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe("Hello5");
    });

    test("Given an async result, it can be correctly mapped to another async result", async () => {
        const result = Result.ok("value");
        const mappedResult = await result
            .asyncMap(async (v) => v.length)
            .asyncResultMap(resultify(async (v) => "Hello" + v))
            .resolve();

        if (mappedResult.isError()) throw new Error("Expected a value");
        expect(mappedResult.unwrap()).toBe("Hello5");
    });

    test("Given an async result that fails, it can be correctly mapped to another async result and maintains its error", async () => {
        const result = Result.error(new TaggedError("some error")) as Result<
            string,
            TaggedError<"some error">
        >;
        const mappedResult = await result
            .asyncMap(async (v) => v.length)
            .asyncResultMap(resultify(async (v) => "Hello" + v))
            .resolve();

        if (mappedResult.isOk()) throw new Error("Expected an error");
        expect(mappedResult.unwrapError()).toEqual(
            new TaggedError("some error")
        );
    });

    test("Given an error, when trying multiple async flat maps, the original error should remain", async () => {
        const result = Result.error(new TestErrorA()) as Result<
            string,
            TaggedError<"TestErrorA">
        >;
        const mappedResult = await result
            .asyncFlatMap(async (value) => Result.ok(value.length))
            .asyncFlatMap((value) => Result.ok(value + 1))
            .asyncFlatMap((value) => Result.ok(value + 1))
            .asyncFlatMap((value) => Result.ok(value + 1))
            .resolve();

        if (mappedResult.isOk()) throw new Error("Expected an error");
        expect(mappedResult.unwrapError()._tag).toBe("TestErrorA");
    });
});
