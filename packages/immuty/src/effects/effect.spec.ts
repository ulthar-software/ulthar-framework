import { Effect } from "./effect.js";
import { Error } from "../errors/error.js";
import { Result } from "../results/result.js";

interface Thing {
    id: string;
    name: string;
}

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

function request(url: string) {
    return Effect.fromPromise(
        () => fetch(url),
        (e) => new FetchError()
    )
        .retry({ errors: ["FetchError"] })
        .mapPromise(
            (r) => r.json(),
            (e) => new JsonBodyError()
        );
}

describe("Effect", () => {
    test("Given a promise, we can create an effect", async () => {
        const effect = Effect.fromPromise(() => Promise.resolve(1));
        const result = await effect.run();

        expect(result).toEqual(Result.ok(1));
    });

    test("Given a promise that can fail, we can create an effect that represents that", async () => {
        class TestError implements Error {
            readonly _tag = "TestError";
            readonly message: string;
            constructor() {
                this.message = "TestError";
            }
        }
        const effect = Effect.fromPromise(
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
        const effect = Effect.fromPromise(() => Promise.resolve(1));
        const result = await effect.map((value) => Result.ok(value + 1)).run();

        expect(result).toEqual(Result.ok(2));
    });
});
