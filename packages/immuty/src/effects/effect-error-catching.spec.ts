import { Result, TaggedError, wrapUnexpectedError } from "../index.js";
import { Effect } from "./effect.js";

class TestErrorA extends TaggedError<"TestErrorA"> {
    constructor(e: unknown) {
        super("TestErrorA", e as Error);
    }
}
describe("Effect Error Catching", () => {
    it("should catch some errors given a partial pattern matcher", async () => {
        const effect = Effect.from(
            async (deps: {
                a: number;
            }): Promise<
                Result<
                    number,
                    TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
                >
            > => {
                return Result.error(new TestErrorA(new Error("error")));
            }
        );

        const result = await effect
            .catchSome({
                TestErrorA: async (error) => 1,
            })
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should fail if a key in the partial matcher is defined but has no value", async () => {
        const effect = Effect.from(
            async (deps: {
                a: number;
            }): Promise<
                Result<
                    number,
                    TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
                >
            > => {
                return Result.error(new TestErrorA(new Error("error")));
            }
        ).catchSome({
            TestErrorA: async (error) => 1,
            TestErrorB: undefined,
        });

        await expect(async () => effect.run({ a: 1 })).rejects.toThrowError(
            `EffectErrorPartialMatch: matcher key 'TestErrorB' is defined but has no handler.`
        );
    });

    it("should catch some errors given a partial pattern matcher and return the original error if no match is found", async () => {
        const effect = Effect.from(
            (deps: {
                a: number;
            }): Result<
                number,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            > => {
                return Result.error(new TestErrorA(new Error("error")));
            }
        );

        const result = await effect
            .catchSome({
                TestErrorB: async (error) => 1,
            })
            .run({ a: 1 });

        expect(result).toEqual(
            Result.error(new TestErrorA(new Error("error")))
        );
    });

    it("should skip the catchSome if the effect is successful", async () => {
        const effect = Effect.from(
            (deps: {
                a: number;
            }): Result<
                number,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            > => {
                return Result.ok(deps.a);
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
        const effect = Effect.from(
            (deps: {
                a: number;
            }): Result<
                number,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            > => {
                return Result.error(new TestErrorA(new Error("error")));
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
        const effect = Effect.from(
            (deps: {
                a: number;
            }): Result<
                number,
                TaggedError<"TestErrorA"> | TaggedError<"TestErrorB">
            > => {
                return Result.ok(deps.a);
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
        const effect = Effect.from(
            async (deps: { a: number }): Promise<Result<number, never>> => {
                throw new Error("error");
            }
        ).orDie();

        expect(effect.run({ a: 1 })).rejects.toThrowError("error");
    });

    it("should not throw if orDie is called on a success", async () => {
        const effect = Effect.from(async (deps: { a: number }) => {
            return Result.ok(deps.a);
        }).orDie();

        expect(effect.run({ a: 1 })).resolves.toEqual(Result.ok(1));
    });
});
