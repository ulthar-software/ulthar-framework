import { DefaultVariant, Result, TaggedError } from "../index.js";
import { Effect } from "./effect.js";

describe("Effects", () => {
    describe("Creation", () => {
        test("Given a function that returns some value, it should return an effect", async () => {
            const effect = Effect.from(() => "Some value");
            expect(effect).toBeInstanceOf(Effect);

            expect(await effect.run()).toEqual(Result.ok("Some value"));
        });

        test("Given a function that returns a result, it should return an effect", async () => {
            const effect = Effect.from(() => Result.ok("Some value"));
            expect(effect).toBeInstanceOf(Effect);

            expect(await effect.run()).toEqual(Result.ok("Some value"));
        });

        test("Given a function that returns a promise, it should return an effect", async () => {
            const effect = Effect.from(() => Promise.resolve("Some value"));
            expect(effect).toBeInstanceOf(Effect);

            expect(await effect.run()).toEqual(Result.ok("Some value"));
        });
    });

    describe("Composition", () => {
        test("Given an effect and a mapping function that returns a value, it should return a new effect", async () => {
            const effect = Effect.from(() => "Some value");
            const mappedEffect = effect.map((value) => value + " mapped");

            expect(await mappedEffect.run()).toEqual(
                Result.ok("Some value mapped")
            );
        });
        test("Given an effect and a mapping function that returns a result, it should return a new effect", async () => {
            const effect = Effect.from(() => "Some value");
            const mappedEffect = effect.map((value) =>
                Result.ok(value + " mapped")
            );

            expect(await mappedEffect.run()).toEqual(
                Result.ok("Some value mapped")
            );
        });

        test("Given an effect and a mapping function that returns a promise, it should return a new effect", async () => {
            const effect = Effect.from(() => "Some value");
            const mappedEffect = effect.map((value) =>
                Promise.resolve(value + " mapped")
            );

            expect(await mappedEffect.run()).toEqual(
                Result.ok("Some value mapped")
            );
        });

        test("Given an effect and a mapping function that returns an effect, it should return a new effect", async () => {
            const effect = Effect.from(() => "Some value");
            const mappedEffect = effect.flatMap((value) =>
                Effect.from(() => value + " mapped")
            );

            expect(await mappedEffect.run()).toEqual(
                Result.ok("Some value mapped")
            );
        });
    });

    describe("Dependencies", () => {
        test("Given an effect that requires dependencies, it should need to be run with those dependencies", async () => {
            const effect = Effect.from((deps: { value: string }) => deps.value);

            expect(await effect.run({ value: "Some value" })).toEqual(
                Result.ok("Some value")
            );
        });

        test("Given an effect that requires dependencies, mapping it should still track those dependencies", async () => {
            const effect = Effect.from((deps: { value: string }) => deps.value);
            const mappedEffect = effect.map((value) => value + " mapped");

            expect(await mappedEffect.run({ value: "Some value" })).toEqual(
                Result.ok("Some value mapped")
            );
        });

        test("Given an effect that requires dependencies, mapping with additional dependencies should track all dependencies", async () => {
            const effect = Effect.from((deps: { value: string }) => deps.value);
            const mappedEffect = effect.map(
                (value, deps: { mapped: string }) => value + " " + deps.mapped
            );

            expect(
                await mappedEffect.run({
                    value: "Some value",
                    mapped: "mapped",
                })
            ).toEqual(Result.ok("Some value mapped"));
        });
    });

    describe("Error handling", () => {
        test("Given an effect that fails, it should return an error result and track its type", async () => {
            const effect = Effect.from(() => {
                return new TaggedError("Some error");
            });

            expect(await effect.run()).toEqual(
                Result.error(new TaggedError("Some error"))
            );
        });
    });

    describe("Value tapping", () => {
        test("Given an effect, tap should run a function with its result but do not modify it", async () => {
            const fn = jest.fn();
            const effect = Effect.from(() => "Some value").tap((v) => fn(v));

            expect(await effect.run()).toEqual(Result.ok("Some value"));
            expect(fn).toHaveBeenCalledWith("Some value");
        });
    });

    describe("Flow control", () => {
        test("Given an effect, 'when' should describe possible branches of execution", async () => {
            const effect = Effect.from(() => "Some value").when({
                "Some value": (value) => Effect.from(() => value + " ok"),
                other: (value) => Effect.from(() => value + " other"),
            });

            expect(await effect.run()).toEqual(Result.ok("Some value ok"));
        });
        test("Given an effect, 'when' should handle default cases", async () => {
            const effect = Effect.from(() => "Some value").when({
                other: (value) => Effect.from(() => value + " other"),
                [DefaultVariant]: (value) =>
                    Effect.from(() => value + " default"),
            });

            expect(await effect.run()).toEqual(Result.ok("Some value default"));
        });
    });
});
