import { TaggedError, wrapUnexpectedError } from "../index.js";
import { liftFn } from "./lift-fn.js";
import { Result } from "./result.js";

describe("Lift Faulty Function", () => {
    class TestError extends TaggedError<"TestError"> {
        constructor(e: unknown) {
            super("TestError", e as Error);
        }
    }

    it("Should lift a reliable synchronous function", () => {
        const reliableFn = (x: number) => x + 1;
        const liftedFn = liftFn(reliableFn);
        expect(liftedFn(1)).toEqual(Result.ok(2));
    });

    it("Should lift a reliable asynchronous function", async () => {
        const reliableFn = async (x: number) => x + 1;
        const liftedFn = liftFn(reliableFn);
        expect(await liftedFn(1)).toEqual(Result.ok(2));
    });

    it("Should lift a faulty synchronous function with a default error wrapper", () => {
        const faultyFn = (x: number): number => {
            throw new Error("Error");
        };
        const liftedFn = liftFn(faultyFn);
        expect(liftedFn(1)).toEqual(
            Result.error(wrapUnexpectedError(new Error("Error")))
        );
    });
    it("Should lift a faulty asynchronous function with a default error wrapper", async () => {
        const faultyFn = async (x: number): Promise<number> => {
            throw new Error("Error");
        };
        const liftedFn = liftFn(faultyFn);
        expect(await liftedFn(1)).toEqual(
            Result.error(wrapUnexpectedError(new Error("Error")))
        );
    });

    it("Should lift a faulty synchronous function", () => {
        const faultyFn = (x: number): number => {
            throw new Error("Error");
        };
        const liftedFn = liftFn(faultyFn, (e) => new TestError(e));
        expect(liftedFn(1)).toEqual(
            Result.error(new TestError(new Error("Error")))
        );
    });

    it("Should lift a faulty asynchronous function", async () => {
        const faultyFn = async (x: number): Promise<number> => {
            throw new Error("Error");
        };
        const liftedFn = liftFn(faultyFn, (e) => new TestError(e));
        expect(await liftedFn(1)).toEqual(
            Result.error(new TestError(new Error("Error")))
        );
    });
});
