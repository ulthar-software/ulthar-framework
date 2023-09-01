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
                return Effect.from((deps: { b: number }) => {
                    return Result.ok(a + deps.b);
                });
            }
        );
        const result = effectFn({ a: 1, b: 2 });
        expect(result).resolves.toEqual(Result.ok(3));
    });
});
