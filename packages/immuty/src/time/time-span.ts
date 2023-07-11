import { Time } from "./time.js";
/**
 * Represents a length of time.
 * It can be used to sleep for a given amount of time
 */
export class TimeSpan {
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

    // INSTANCE METHODS
    async sleep() {
        await Time.sleep(this);
    }

    subtract(other: TimeSpan) {
        return TimeSpan.milliseconds(this.ms - other.ms);
    }

    add(other: TimeSpan) {
        return TimeSpan.milliseconds(this.ms + other.ms);
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
