import { TimeSpan } from "./time-span.js";

interface BackoffOptions {
    backoff: BackoffFn;
    maxIterations?: number;
    maxDelay?: TimeSpan;
}

interface DelayOptions {
    delay: TimeSpan;
    maxIterations?: number;
}

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

    static fromBackoff({
        backoff,
        maxDelay,
        maxIterations,
    }: BackoffOptions): Schedule {
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

type BackoffFn = (i: number) => TimeSpan;

export namespace Backoff {
    export function exponential(
        start: TimeSpan = TimeSpan.seconds(1)
    ): BackoffFn {
        return (i) => TimeSpan.milliseconds(start.toMilliseconds() * i * i);
    }

    export function linear(start: TimeSpan = TimeSpan.seconds(1)): BackoffFn {
        return (i) => TimeSpan.milliseconds(start.toMilliseconds() * i);
    }

    export function fibonacci(
        start: TimeSpan = TimeSpan.seconds(1)
    ): BackoffFn {
        return (i) => {
            if (i === 0 || i === 1)
                return TimeSpan.milliseconds(start.toMilliseconds());
            if (i === 2)
                return TimeSpan.milliseconds(start.toMilliseconds() * 2);
            return TimeSpan.milliseconds(
                start.toMilliseconds() * (i - 1) +
                    start.toMilliseconds() * (i - 2)
            );
        };
    }
}

export type ScheduleSleepGenerator = AsyncGenerator<void, void, void>;

type ScheduleFn = () => ScheduleSleepGenerator;
