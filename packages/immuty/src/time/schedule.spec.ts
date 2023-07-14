import { Schedule } from "./schedule.js";
import { TimeSpan } from "./time-span.js";
import { Time } from "./time.js";

describe("Schedule", () => {
    afterEach(() => {
        Time.useRealTime();
    });
    it("should define a schedule given a simple delay and a number of repetitions", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromDelay({
            delay: TimeSpan.seconds(1),
            maxIterations: 3,
        });
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule) {
            fn();
        }
        expect(Time.now() - now).toBe(3000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should schedule indefinitely if no maxIterations is given", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromDelay({
            delay: TimeSpan.seconds(1),
        });
        const now = Time.now();
        let i = 0;
        for await (const _ of schedule) {
            i++;
            if (i === 10) {
                break;
            }
        }
        expect(Time.now() - now).toBe(10000);
    });

    it("should define a schedule given a backoff function", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff((i) => TimeSpan.seconds(i + 1), {
            maxIterations: 3,
        });
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule) {
            fn();
        }
        expect(Time.now() - now).toBe(6000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should define stop backoff if maxDelay is reached", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff((i) => TimeSpan.seconds(i + 1), {
            maxDelay: TimeSpan.seconds(2),
        });
        const now = Time.now();
        let i = 0;
        for await (const _ of schedule) {
            i++;
            if (i === 3) {
                break;
            }
        }
        expect(Time.now() - now).toBe(5000);
    });

    it("should define an infinitely increasing backoff if no maxDelay or maxIterations are given", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff((i) => TimeSpan.seconds(i + 1));
        const now = Time.now();
        let i = 0;
        for await (const _ of schedule) {
            i++;
            if (i === 3) {
                break;
            }
        }
        expect(Time.now() - now).toBe(6000);
    });

    it("should define a schedule for 'once'", async () => {
        Time.useFakeTime();
        const schedule = Schedule.once(TimeSpan.seconds(1));
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule) {
            fn();
        }
        expect(Time.now() - now).toBe(1000);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should run instantly with 'once' if no delay is specified", async () => {
        Time.useFakeTime();
        const schedule = Schedule.once();
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule) {
            fn();
        }
        expect(Time.now() - now).toBe(0);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should define a schedule for 'times'", async () => {
        Time.useFakeTime();
        const schedule = Schedule.times(3, TimeSpan.seconds(1));
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule) {
            fn();
        }
        expect(Time.now() - now).toBe(3000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should run instantly with 'times' if no delay is specified", async () => {
        Time.useFakeTime();
        const schedule = Schedule.times(3);
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule) {
            fn();
        }
        expect(Time.now() - now).toBe(0);
        expect(fn).toHaveBeenCalledTimes(3);
    });
});
