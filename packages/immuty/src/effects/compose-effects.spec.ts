import { Result } from "../index.js";
import { composeEffects } from "./compose-effects.js";

describe("Compose Effects", () => {
    it("should compose effects", () => {
        const effectFn = composeEffects(
            async (deps: { a: number }) => {
                return Result.ok(deps.a);
            },
            async (a: number, deps: { b: number }) => {
                return Result.ok(a + deps.b);
            }
        );

        const result = effectFn({ a: 1, b: 2 });
        expect(result).resolves.toEqual(Result.ok(3));
    });
});
