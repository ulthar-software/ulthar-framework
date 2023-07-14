import { BackoffFn } from "./backoff.js";
import { TimeSpan } from "./time-span.js";

export class Schedule {
    static once(delay?: TimeSpan): Schedule {
        return new Schedule(async function* () {
            if (delay) {
                await delay.sleep();
                yield;
            } else {
                yield;
            }
        });
    }

    static fromDelay({ delay, maxIterations }: DelayOptions): Schedule {
        return new Schedule(async function* () {
            let i = 0;
            while (!maxIterations || i < maxIterations) {
                await delay.sleep();
                yield;
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
                    yield;
                }
                await delay.sleep();
                yield;
                i++;
            }
        });
    }

    start(): ScheduleSleepGenerator {
        return this.f();
    }

    constructor(private readonly f: ScheduleFn) {}
}

interface BackoffOptions {
    maxIterations?: number;
    maxDelay?: TimeSpan;
}

interface DelayOptions {
    delay: TimeSpan;
    maxIterations?: number;
}

export type ScheduleSleepGenerator = AsyncGenerator<void, void, void>;

export type ScheduleFn = () => ScheduleSleepGenerator;
