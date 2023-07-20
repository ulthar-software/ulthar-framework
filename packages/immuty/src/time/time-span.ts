import { PosixDate } from "./posix-date.js";
import { Time } from "./time.js";
/**
 * Represents a length of time.
 * It can be used to sleep for a given amount of time
 */
export class TimeSpan {
    static from(parts: TimeSpanParts): TimeSpan {
        return TimeSpan.milliseconds(
            (parts.days ?? 0) * 24 * 60 * 60 * 1000 +
                (parts.hours ?? 0) * 60 * 60 * 1000 +
                (parts.minutes ?? 0) * 60 * 1000 +
                (parts.seconds ?? 0) * 1000 +
                (parts.milliseconds ?? 0)
        );
    }
    // STATIC METHODS
    static milliseconds(ms: number) {
        return new TimeSpan(ms);
    }
    static seconds(seconds: number): TimeSpan {
        return this.milliseconds(seconds * 1000);
    }
    static minutes(minutes: number): TimeSpan {
        return this.seconds(minutes * 60);
    }
    static hours(hrs: number) {
        return this.minutes(hrs * 60);
    }
    static days(days: number) {
        return this.hours(days * 24);
    }
    static fromDifference(start: PosixDate, end: PosixDate) {
        return new TimeSpan(end.toMilliseconds() - start.toMilliseconds());
    }

    // INSTANCE METHODS
    async sleep() {
        await Time.sleep(this);
    }

    isZero() {
        return this.ms === 0;
    }

    subtract(other: TimeSpan) {
        return TimeSpan.milliseconds(this.ms - other.ms);
    }

    add(other: TimeSpan) {
        return TimeSpan.milliseconds(this.ms + other.ms);
    }

    isGreaterThan(other: TimeSpan) {
        return this.ms > other.ms;
    }

    constructor(private readonly ms: number) {}

    toMilliseconds() {
        return this.ms;
    }

    toSeconds(): number {
        return this.ms / 1000;
    }

    toMinutes(): number {
        return this.toSeconds() / 60;
    }

    toHours(): number {
        return this.toMinutes() / 60;
    }

    toDays(): number {
        return this.toHours() / 24;
    }
}

interface TimeSpanParts {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
}
