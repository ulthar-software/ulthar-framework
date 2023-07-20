import { Backoff } from "./backoff.js";
import { Schedule } from "./schedule.js";
import { Time } from "./time.js";

describe("Backoff", () => {
    it("should define a linear backoff", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff(Backoff.linear(), {
            maxIterations: 4,
        });
        const now = Time.now();
        for await (const _ of schedule) {
        }
        expect(Time.now() - now).toBe(600);
    });

    it("should define a fibonacci backoff", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff(Backoff.fibonacci(), {
            maxIterations: 4,
        });
        const now = Time.now();
        for await (const _ of schedule) {
        }
        expect(Time.now() - now).toBe(700);
    });

    it("should define an exponential backoff", async () => {
        Time.useFakeTime();
        const schedule = Schedule.fromBackoff(Backoff.exponential(), {
            maxIterations: 4,
        });
        const now = Time.now();
        for await (const _ of schedule) {
        }
        expect(Time.now() - now).toBe(1400);
    });
});
