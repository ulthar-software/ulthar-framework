import { Backoff, Schedule } from "./schedule.js";
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
        for await (const _ of schedule.start()) {
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
        for await (const _ of schedule.start()) {
            i++;
            if (i === 10) {
                break;
            }
        }
        expect(Time.now() - now).toBe(10000);
    });

    it("should define a schedule given a backoff function", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff({
            backoff: (i) => TimeSpan.seconds(i + 1),
            maxIterations: 3,
        });
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule.start()) {
            fn();
        }
        expect(Time.now() - now).toBe(6000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should define stop backoff if maxDelay is reached", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff({
            backoff: (i) => TimeSpan.seconds(i + 1),
            maxDelay: TimeSpan.seconds(2),
        });
        const now = Time.now();
        let i = 0;
        for await (const _ of schedule.start()) {
            i++;
            if (i === 3) {
                break;
            }
        }
        expect(Time.now() - now).toBe(5000);
    });

    it("should define a linear backoff", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff({
            backoff: Backoff.linear(),
            maxIterations: 4,
        });
        const now = Time.now();
        for await (const _ of schedule.start()) {
        }
        expect(Time.now() - now).toBe(6000);
    });

    it("should define a fibonacci backoff", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff({
            backoff: Backoff.fibonacci(),
            maxIterations: 4,
        });
        const now = Time.now();
        for await (const _ of schedule.start()) {
        }
        expect(Time.now() - now).toBe(7000);
    });

    it("should define an exponential backoff", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff({
            backoff: Backoff.exponential(),
            maxIterations: 4,
        });
        const now = Time.now();
        for await (const _ of schedule.start()) {
        }
        expect(Time.now() - now).toBe(14000);
    });

    it("should define a schedule for 'once'", async () => {
        Time.useFakeTime();
        const schedule = Schedule.once(TimeSpan.seconds(1));
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule.start()) {
            fn();
        }
        expect(Time.now() - now).toBe(1000);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("'once' should run instantly if no delay is specified", async () => {
        Time.useFakeTime();
        const schedule = Schedule.once();
        const now = Time.now();
        const fn = jest.fn();
        for await (const _ of schedule.start()) {
            fn();
        }
        expect(Time.now() - now).toBe(0);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
