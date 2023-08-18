import {
    Effect,
    Result,
    Time,
    TimeSpan,
    defaultErrorWrapper,
} from "../index.js";
import { Schedule } from "../time/schedule.js";

describe("Effect Stream", () => {
    beforeAll(() => {
        Time.useFakeTime();
    });
    afterAll(() => {
        Time.useRealTime();
    });
    it("should map the stream values into another effect", async () => {
        //create a stream from an effect
        const stream = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                return deps.a;
            }
        ).schedule(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            })
        );

        const fn = jest.fn();
        //map the stream values into another effect
        const mappedStream = stream.map(
            async ([other, deps]: [number, { b: number }]) => {
                const result = Result.ok(other + deps.b + 1);
                fn(result);
                return result;
            }
        );

        //start the stream
        await mappedStream.run({ a: 5, b: 1 });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenNthCalledWith(1, Result.ok(7));
        expect(fn).toHaveBeenNthCalledWith(2, Result.ok(7));
        expect(fn).toHaveBeenNthCalledWith(3, Result.ok(7));
    });

    it("should return the failed result when mapping over a failed effect", async () => {
        const effect = Effect.fromPromise(
            async (deps: { a: number }): Promise<number> => {
                throw new Error("error");
            }
        ).schedule(
            Schedule.every(TimeSpan.seconds(5), {
                maxIterations: 3,
            })
        );

        const successFn = jest.fn();

        const mappedStream = effect.map(
            async ([other, deps]: [number, { b: number }]) => {
                const result = Result.ok(other + deps.b + 1);
                successFn(result);
                return result;
            }
        );

        await mappedStream.run({ a: 5, b: 1 });

        expect(successFn).not.toHaveBeenCalled();
    });
});
