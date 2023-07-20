import { Result } from "../index.js";
import { Effect } from "./effect.js";
import { pipeEffects } from "./pipe-effects.js";

describe("Pipe Effects", () => {
    it("should pipe effects", () => {
        const effectFn = pipeEffects(
            async (deps: { a: number }) => {
                return Result.ok(deps.a);
            },
            (a) => {
                return Effect.fromPromise(async (deps: { b: number }) => {
                    return a + deps.b;
                });
            }
        );
        const result = effectFn({ a: 1, b: 2 });
        expect(result).resolves.toEqual(Result.ok(3));
    });
});
