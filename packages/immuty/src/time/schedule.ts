import { IEventSource } from "../events/event-stream.js";
import { Result } from "../index.js";
import { BackoffFn } from "./backoff.js";
import { cronNextSpan } from "./cron-next-span.js";
import { CronDefinition } from "./parse-cron.js";
import { TimeSpan } from "./time-span.js";

export class Schedule implements IEventSource<void, never> {
    static once(delay?: TimeSpan): Schedule {
        return new Schedule(async function* () {
            if (delay) {
                await delay.sleep();
            }
            yield Result.ok(undefined);
        });
    }

    static times(n: number, delay?: TimeSpan): Schedule {
        return new Schedule(async function* () {
            for (let i = 0; i < n; i++) {
                if (delay) {
                    await delay.sleep();
                }
                yield Result.ok(undefined);
            }
        });
    }

    static every(
        delay: TimeSpan,
        { maxIterations }: DelayOptions = {}
    ): Schedule {
        return new Schedule(async function* () {
            let i = 0;
            while (!maxIterations || i < maxIterations) {
                await delay.sleep();
                yield Result.ok(undefined);
                i++;
            }
        });
    }

    static fromBackoff(
        backoff: BackoffFn,
        { maxDelay, maxIterations }: BackoffOptions = {}
    ): Schedule {
        return new Schedule(async function* () {
            let i = 0;
            while (!maxIterations || i < maxIterations) {
                const delay = backoff(i);
                if (maxDelay && delay.isGreaterThan(maxDelay)) {
                    await maxDelay.sleep();
                    yield Result.ok(undefined);
                }
                await delay.sleep();
                yield Result.ok(undefined);
                i++;
            }
        });
    }

    static fromCron(cron: CronDefinition): Schedule {
        return new Schedule(async function* () {
            while (true) {
                const nexSpan = cronNextSpan(cron);
                await nexSpan.sleep();
                yield Result.ok(undefined);
            }
        });
    }

    [Symbol.asyncIterator](): ScheduleSleepGenerator {
        return this.f();
    }

    constructor(private readonly f: ScheduleFn) {}
}

interface BackoffOptions {
    maxIterations?: number;
    maxDelay?: TimeSpan;
}

interface DelayOptions {
    maxIterations?: number;
}

export type ScheduleSleepGenerator = AsyncGenerator<
    Result<void, never>,
    void,
    void
>;

export type ScheduleFn = () => ScheduleSleepGenerator;
