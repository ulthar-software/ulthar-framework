import { TimeSpan } from "./time-span.js";

export type BackoffFn = (i: number) => TimeSpan;

export namespace Backoff {
    export function exponential(
        start: TimeSpan = TimeSpan.milliseconds(100)
    ): BackoffFn {
        return (i) => TimeSpan.milliseconds(start.toMilliseconds() * i * i);
    }

    export function linear(
        start: TimeSpan = TimeSpan.milliseconds(100)
    ): BackoffFn {
        return (i) => TimeSpan.milliseconds(start.toMilliseconds() * i);
    }

    export function fibonacci(
        start: TimeSpan = TimeSpan.milliseconds(100)
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
