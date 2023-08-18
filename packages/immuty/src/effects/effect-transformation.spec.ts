import { Result, defaultErrorWrapper } from "../index.js";
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

    it("should mapPromise an effect given a function that maps the result", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect
            .mapPromise(async ([value]) => value + 1)
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(2));
    });

    it("should tap the result of an effect when the result is OK", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const fn = jest.fn();
        const result = await effect.tap(fn).run({ a: 1 });

        expect(fn).toHaveBeenCalledWith(result);
        expect(result).toEqual(Result.ok(1));
    });
    it("should tap the result of an effect even if the effect fails", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            throw new Error("error");
        });
        const fn = jest.fn();
        const result = await effect.tap(fn).run({ a: 1 });

        expect(fn).toHaveBeenCalledWith(result);
        expect(result).toEqual(
            Result.error(defaultErrorWrapper(new Error("error")))
        );
    });

    test("mapping a sync function should work", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect
            .mapSync(([value]) => value + 1)
            .run({ a: 1 });

        expect(result).toEqual(Result.ok(2));
    });

    test("mapping a sync function that fails should work", async () => {
        const effect = Effect.fromPromise(async (deps: { a: number }) => {
            return deps.a;
        });
        const result = await effect
            .mapSync(() => {
                throw new Error("error");
            })
            .run({ a: 1 });

        expect(result).toEqual(
            Result.error(defaultErrorWrapper(new Error("error")))
        );
    });

    test("spreading and mapping a function that returns an array", async () => {
        const effect = Effect.fromSync(() => {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        });
        const result = await effect
            .spread()
            .mapSync(([value]) => value + 1)
            .collectAll()
            .run();

        expect(result).toEqual(Result.ok([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
    });
});
