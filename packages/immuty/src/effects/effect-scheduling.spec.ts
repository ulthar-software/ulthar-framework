import {
    Effect,
    Result,
    TaggedError,
    Time,
    TimeSpan,
    wrapUnexpectedError,
} from "../index.js";
import { Schedule } from "../time/schedule.js";

class TaggedErrorA extends TaggedError<"TestErrorA"> {
    constructor(e: unknown) {
        super("TestErrorA", e as Error);
    }
}

class TaggedErrorB extends TaggedError<"TestErrorB"> {
    constructor(e: unknown) {
        super("TestErrorB", e as Error);
    }
}

describe("Effect Scheduling", () => {
    beforeAll(() => {
        Time.useFakeTime();
    });
    afterAll(() => {
        Time.useRealTime();
    });

    it("should delay the execution of the effect", async () => {
        const effect = Effect.from(async (deps: { a: number }) => {
            return Result.ok(deps.a);
        });

        const start = Time.now();
        const result = await effect.delayedRun(TimeSpan.seconds(5), { a: 1 });
        const end = Time.now();

        expect(result).toEqual(Result.ok(1));
        expect(end - start).toBe(5000);
    });

    it("should retry the execution of the effect", async () => {
        let count = 0;
        const effect = Effect.from(async (deps: { a: number }) => {
            if (count < 3) {
                count++;
                return Result.error(wrapUnexpectedError(new Error("error")));
            }
            return Result.ok(deps.a);
        }).retry(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            })
        );

        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should retry the execution of the effect but fail if the schedule ends before an Ok result", async () => {
        const fn = jest.fn();
        let count = 0;
        const effect = Effect.from(async (deps: { a: number }) => {
            if (count < 3) {
                count++;
                return Result.error(wrapUnexpectedError(new Error("error")));
            }
            return Result.ok(deps.a);
        })
            .tapError(fn)
            .retry(
                Schedule.every(TimeSpan.seconds(5), {
                    maxIterations: 2,
                })
            );

        const result = await effect.run({ a: 1 });

        expect(fn).toHaveBeenCalledTimes(3);

        expect(result).toEqual(
            Result.error(wrapUnexpectedError(new Error("error")))
        );
    });

    it("should only retry the effect given specific errors", async () => {
        let count = 0;

        const effect = Effect.from(
            Result.wrap(({ a }: { a: number }) => {
                if (a === 1) {
                    return new TaggedErrorA("errorA");
                }
                if (a === 2 && count < 2) {
                    count++;
                    return new TaggedErrorB("errorB");
                }
                return a;
            })
        ).retry(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            }),
            { onlyOn: ["TestErrorB"] }
        );

        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.error(new TaggedErrorA("errorA")));

        const result2 = await effect.run({ a: 2 });

        expect(result2).toEqual(Result.ok(2));
    });

    it("should skip a retry if the result is Ok", async () => {
        const effect = Effect.from(
            Result.wrap((deps: { a: number }) => {
                return deps.a;
            })
        ).retry(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            })
        );

        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.ok(1));
    });

    it("should create an Effect stream from a schedule", async () => {
        const fn = jest.fn();
        const effect = Effect.from(
            Result.wrap((deps: { a: number }) => {
                return fn(deps.a);
            })
        );

        const stream = effect.schedule(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            })
        );

        await stream.run({ a: 1 });

        expect(fn).toHaveBeenCalledTimes(3);
    });
});
