import { TimeSpan } from "./time-span.js";
import { Time } from "./time.js";

export class PosixDate {
    nextWeekDay(dayOfWeek: number) {
        const daysToAdd = (dayOfWeek + 7 - this.dayOfWeek) % 7;
        return this.add(TimeSpan.days(daysToAdd)).set({
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        });
    }
    static from(parts: PosixDateParts): PosixDate {
        const currentDate = new Date();
        return new PosixDate(
            Date.UTC(
                parts.year ?? currentDate.getUTCFullYear(),
                parts.month ? parts.month - 1 : currentDate.getUTCMonth(),
                parts.dayOfMonth ?? currentDate.getUTCDate(),
                parts.hours ?? 0,
                parts.minutes ?? 0,
                parts.seconds ?? 0,
                parts.milliseconds ?? 0
            )
        );
    }

    set(parts: PosixDateParts): PosixDate {
        return PosixDate.from({
            year: this.year,
            month: this.month,
            dayOfMonth: this.dayOfMonth,
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds,
            milliseconds: this.milliseconds,
            ...parts,
        });
    }

    add(timeSpan: TimeSpan): PosixDate {
        return new PosixDate(this.date.getTime() + timeSpan.toMilliseconds());
    }

    subtract(timeSpan: TimeSpan): PosixDate {
        return new PosixDate(this.date.getTime() - timeSpan.toMilliseconds());
    }

    notEquals(otherDate: PosixDate) {
        return this.toMilliseconds() !== otherDate.toMilliseconds();
    }

    startOfDay(): PosixDate {
        return PosixDate.from({
            year: this.year,
            month: this.month,
            dayOfMonth: this.dayOfMonth,
        });
    }

    startOfNextDay(): PosixDate {
        return this.startOfDay().add(TimeSpan.days(1));
    }

    toMilliseconds(): number {
        return this.date.getTime();
    }

    get dayOfWeek(): number {
        return this.date.getUTCDay();
    }
    get month() {
        return this.date.getUTCMonth() + 1;
    }
    get dayOfMonth(): number {
        return this.date.getUTCDate();
    }
    get hours(): number {
        return this.date.getUTCHours();
    }
    get minutes(): number {
        return this.date.getUTCMinutes();
    }
    get seconds(): number {
        return this.date.getUTCSeconds();
    }
    get milliseconds(): number {
        return this.date.getUTCMilliseconds();
    }
    get year(): number {
        return this.date.getUTCFullYear();
    }

    private date: Date;
    constructor(posixMs: number) {
        this.date = new Date(posixMs);
    }

    static now(): PosixDate {
        return new PosixDate(Time.now());
    }
}

interface PosixDateParts {
    year?: number;
    month?: number;
    dayOfMonth?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
}
