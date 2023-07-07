import { Effect } from "./effect.js";
import { createTaggedError } from "../errors/error.js";
import { Result } from "../results/result.js";

const TestError = createTaggedError("TestError");

describe("Effect", () => {
    test("Given a simple promise, it should create an runnable effect with correct inferred types", async () => {
        const effect = Effect.fromPromise(() => Promise.resolve(1));
        const result = await effect.run();
        expect(result).toEqual(Result.ok(1));
    });
    test("Given a simple synchronous function, it should create an runnable effect with correct inferred types", async () => {
        const effect = Effect.from(() => 1);
        const result = await effect.run();
        expect(result).toEqual(Result.ok(1));
    });

    test("Given a promise that can fail, it should create an effect with correct inferred types", async () => {
        const effect = Effect.fromPromise(
            () => Promise.reject("error"),
            (e) => TestError("Test error")
        );
        const result = await effect.run();

        if (result.isOk()) {
            throw new Error("Expected error");
        }

        expect(result.unwrapError()).toEqual(TestError("Test error"));
    });

    test("Given an effect, it can be mapped into another effect", async () => {
        const effect = Effect.fromPromise(() => Promise.resolve("Some value"));
        const effect2 = effect.map(async (value) => value.length);
        const result = await effect2.run();
        expect(result).toEqual(Result.ok(10));
    });

    test("Given an effect, it can be mapped to another effect from a result", async () => {
        const effect = Effect.fromPromise(() => Promise.resolve([1]));
        const effect2 = effect.mapResult(async (value) =>
            Result.ok([value[0] + 1])
        );
        const result = await effect2.run();
        expect(result).toEqual(Result.ok([2]));
    });

    test("Given an effect, it can be mapped to another effect from an effect", async () => {
        const effect = Effect.fromPromise(() => Promise.resolve([1]));
        const effect2 = effect.flatMap((value) =>
            Effect.fromPromise(() => Promise.resolve([value[0] + 1]))
        );
        const result = await effect2.run();
        expect(result).toEqual(Result.ok([2]));
    });

    test("Given an effect, it can be folded into another effect that cannot fail", async () => {
        function maybeFailedPromise(shouldFail: boolean): Promise<number> {
            return !shouldFail ? Promise.resolve(2) : Promise.reject("error");
        }

        const failedEffect = Effect.fromPromise(
            () => maybeFailedPromise(true),
            (e) => TestError("Test error")
        );
        const foldedEffect1 = failedEffect.fold(
            async (value) => value.toString(),
            async (error) => "5"
        );
        const result1 = await foldedEffect1.run();
        expect(result1).toEqual(Result.ok("5"));

        const okEffect = Effect.fromPromise(
            () => maybeFailedPromise(false),
            (e) => TestError("Test error")
        );
        const foldedEffect2 = okEffect.fold(
            async (value) => value.toString(),
            async (error) => "5"
        );
        const result2 = await foldedEffect2.run();
        expect(result2).toEqual(Result.ok("2"));
    });

    test("Given an effect that can fail, it can be retried", async () => {
        let count = 0;
        const effect = Effect.fromPromise(
            () => {
                count++;
                return count === 1
                    ? Promise.reject("error")
                    : Promise.resolve(count);
            },
            (e) => TestError("Test error")
        );
        const result = await effect.retry().run();
        expect(result).toEqual(Result.ok(2));
    });

    test("Given an effect that can fail, when retried a max number of times, it will fail", async () => {
        let count = 0;
        const effect = Effect.fromPromise(
            () => {
                count++;
                return Promise.reject("error");
            },
            (e) => TestError("Test error")
        );
        const result = await effect
            .retry({
                maxRetries: 4,
            })
            .run();
        expect(result).toEqual(Result.error(TestError("Test error")));
        expect(count).toEqual(5); //One more than max retries
    });

    test("Given an effect that can fail, when retried only on specific errors, it will only retry on those errors", async () => {
        let count = 0;
        const ErrorA = createTaggedError("ErrorA");
        const ErrorB = createTaggedError("ErrorB");
        const effect = Effect.fromPromise(
            () => {
                count++;
                if (count === 1) {
                    return Promise.reject("error A");
                }
                if (count === 2) {
                    return Promise.reject("error B");
                }
                return Promise.resolve(count);
            },
            (e) => {
                if (e == "error") return ErrorA("Test error");
                return ErrorB("Test error");
            }
        );
        const result = await effect
            .retry({
                maxRetries: 5,
                onlyOnErrors: ["ErrorA"],
            })
            .run();
        expect(result).toEqual(Result.error(ErrorB("Test error")));
    });
});
