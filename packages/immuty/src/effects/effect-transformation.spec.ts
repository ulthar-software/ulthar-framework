import { Result } from "../index.js";
import { Effect } from "./effect.js";

describe("Effect Transformation", () => {
    it("should map an effect given a function that maps the result", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect
            .map(async ([value]) => Result.ok(value + 1))
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(2));
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
});
