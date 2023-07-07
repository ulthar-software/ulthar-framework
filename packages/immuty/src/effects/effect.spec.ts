import { Effect } from "./effect.js";
import { Error } from "../errors/error.js";
import { Result } from "../results/result.js";
import { Fn } from "../functions/unary.js";

class FetchError implements Error {
    readonly _tag = "FetchError";
    readonly message: string;
    constructor() {
        this.message = "FetchError";
    }
}
class JsonBodyError implements Error {
    readonly _tag = "JsonBodyError";
    readonly message: string;
    constructor() {
        this.message = "JsonBodyError";
    }
}

interface RequestDependencies {
    fetch: Fn<string, Promise<Response>>;
}

function request(url: string) {
    return Effect.of(
        ({ fetch }: RequestDependencies) => fetch(url),
        (e) => new FetchError()
    )
        .retry()
        .map(
            (r) => r.json(),
            (e) => new JsonBodyError()
        );
}

const demoEffect = request("https://jsonplaceholder.typicode.com/todos/1").map(
    async (value) => {
        return value as { userId: number };
    }
);

describe("Effect", () => {
    test("Given a simple promise, it should create an runnable effect with correct inferred types", async () => {
        const effect = Effect.of(() => Promise.resolve(1));
        const result = await effect.run();
        expect(result).toEqual(Result.ok(1));
    });

    test("Given a promise that can fail, it should create an effect with correct inferred types", async () => {
        class TestError implements Error {
            readonly _tag = "TestError";
            readonly message: string;
            constructor() {
                this.message = "TestError";
            }
        }
        const effect = Effect.of(
            () => Promise.reject("error"),
            (e) => new TestError()
        );
        const result = await effect.run();

        if (result.isOk()) {
            throw new Error("Expected error");
        }

        expect(result.unwrapError()).toBeInstanceOf(TestError);
    });

    test("Given any effect, it can be mapped into another effect", async () => {
        const effect = Effect.of(() => Promise.resolve([1]));
        await expect(effect.run()).resolves.toEqual(Result.ok([1]));
        const effect2 = effect.map(async (value) => [value[0] + 1]);
        const result = await effect2.run();
        expect(result).toEqual(Result.ok([2]));
    });
});
