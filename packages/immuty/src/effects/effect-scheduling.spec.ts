import {
    Effect,
    Result,
    TaggedError,
    Time,
    TimeSpan,
    createTaggedError,
    defaultErrorWrapper,
} from "../index.js";
import { Schedule } from "../time/schedule.js";

describe("Effect Scheduling", () => {
    beforeAll(() => {
        Time.useFakeTime();
    });
    afterAll(() => {
        Time.useRealTime();
    });

    it("should delay the execution of the effect", async () => {
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return deps.a;
            }
        );

        const start = Time.now();
        const result = await effect.delayedRun(TimeSpan.seconds(5), { a: 1 });
        const end = Time.now();

        expect(result).toEqual(Result.ok(1));
        expect(end - start).toBe(5000);
    });

    it("should retry the execution of the effect", async () => {
        let count = 0;
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                if (count < 3) {
                    count++;
                    throw new Error("error");
                }
                return deps.a;
            }
        ).retry(
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
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                if (count < 3) {
                    count++;
                    throw new Error("error");
                }
                return deps.a;
            }
        )
            .tap(fn)
            .retry(
                Schedule.every(TimeSpan.seconds(5), {
                    maxIterations: 2,
                })
            );

        const result = await effect.run({ a: 1 });

        expect(fn).toHaveBeenCalledTimes(3);

        expect(result).toEqual(
            Result.error(defaultErrorWrapper(new Error("error")))
        );
    });

    it("should only retry the effect given specific errors", async () => {
        const TestErrorA = createTaggedError("TestErrorA");
        const TestErrorB = createTaggedError("TestErrorB");

        let count = 0;

        const effect = Effect.fromPromise(
            async ({ a }: { a: number }): Promise<number> => {
                if (a === 1) {
                    throw "errorA";
                }
                if (a === 2 && count < 2) {
                    count++;
                    throw "errorB";
                }
                return a;
            },
            (err): TaggedError<"TestErrorA"> | TaggedError<"TestErrorB"> => {
                if (err === "errorA") {
                    return TestErrorA(err);
                } else {
                    return TestErrorB(err as string);
                }
            }
        ).retry(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            }),
            { onlyOn: ["TestErrorB"] }
        );

        const result = await effect.run({ a: 1 });

        expect(result).toEqual(Result.error(TestErrorA("errorA")));

        const result2 = await effect.run({ a: 2 });

        expect(result2).toEqual(Result.ok(2));
    });

    it("should skip a retry if the result is Ok", async () => {
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return deps.a;
            }
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
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return fn(deps.a);
            }
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
