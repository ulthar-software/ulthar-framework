import { Result, TaggedError, createTaggedError } from "../index.js";
import { Effect } from "./effect.js";

describe("Effect Error Catching", () => {
    it("should catch some errors given a partial pattern matcher", async () => {
        const TestErrorA = createTaggedError("TestErrorA");

        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                throw new Error("error");
            },
            (err): TaggedError<"TestErrorA"> | TaggedError<"TestErrorB"> => {
                return TestErrorA(err as Error);
            }
        );

        const result = await effect
            .catchSome({
                TestErrorA: async (error) => 1,
            })
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should catch some errors given a partial pattern matcher and return the original error if no match is found", async () => {
        const TestErrorA = createTaggedError("TestErrorA");

        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                throw new Error("error");
            },
            (err): TaggedError<"TestErrorA"> | TaggedError<"TestErrorB"> => {
                return TestErrorA(err as Error);
            }
        );

        const result = await effect
            .catchSome({
                TestErrorB: async (error) => 1,
            })
            .run({ a: 1 });

        expect(result).toEqual(Result.error(TestErrorA(new Error("error"))));
    });

    it("should skip the catchSome if the effect is successful", async () => {
        const TestErrorA = createTaggedError("TestErrorA");

        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return deps.a;
            },
            (err): TaggedError<"TestErrorA"> | TaggedError<"TestErrorB"> => {
                return TestErrorA(err as Error);
            }
        );

        const result = await effect
            .catchSome({
                TestErrorB: async (error) => 1,
            })
            .run({ a: 5 });

        expect(result).toEqual(Result.ok(5));
    });

    it("should catch all errors given a full pattern matcher", async () => {
        const TestErrorA = createTaggedError("TestErrorA");

        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                throw new Error("error");
            },
            (err): TaggedError<"TestErrorA"> | TaggedError<"TestErrorB"> => {
                return TestErrorA(err as Error);
            }
        );

        const result = await effect
            .catchAll({
                TestErrorA: async (error) => 1,
                TestErrorB: async (error) => 2,
            })
            .run({ a: 5 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should skip the catchAll if the effect is successful", async () => {
        const TestErrorA = createTaggedError("TestErrorA");

        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return deps.a;
            },
            (err): TaggedError<"TestErrorA"> | TaggedError<"TestErrorB"> => {
                return TestErrorA(err as Error);
            }
        );

        const result = await effect
            .catchAll({
                TestErrorA: async (error) => 1,
                TestErrorB: async (error) => 2,
            })
            .run({ a: 5 });

        expect(result).toEqual(Result.ok(5));
    });

    it("should throw if orDie is called on an error", async () => {
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                throw new Error("error");
            }
        ).orDie();

        expect(effect.run({ a: 1 })).rejects.toThrowError("error");
    });

    it("should not throw if orDie is called on a success", async () => {
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return deps.a;
            }
        ).orDie();

        expect(effect.run({ a: 1 })).resolves.toEqual(Result.ok(1));
    });
});
