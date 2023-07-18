import { PosixDate } from "./posix-date.js";
import { TimeSpan } from "./time-span.js";
import { Time } from "./time.js";

describe("posix-date", () => {
    it("should create a PosixDate from a timestamp", () => {
        const timestamp = Time.now();
        const posixDate = new PosixDate(timestamp);
        expect(posixDate.toMilliseconds()).toEqual(timestamp);
    });

    it("should create a PosixDate from a date", () => {
        const date = new Date();
        const posixDate = PosixDate.from({
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            dayOfMonth: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes(),
            seconds: date.getUTCSeconds(),
            milliseconds: date.getUTCMilliseconds(),
        });
        expect(posixDate.toMilliseconds()).toEqual(date.getTime());
    });

    test("get the next week day from some date", () => {
        const now = PosixDate.from({
            year: 2021,
            month: 1,
            dayOfMonth: 1,
        });
        const nextMonday = now.nextWeekDay(1);
        expect(nextMonday.dayOfMonth).toEqual(4);
    });

    test("subtract a time span from a date", () => {
        const now = PosixDate.from({
            year: 2021,
            month: 1,
            dayOfMonth: 1,
        });
        const yesterday = now.subtract(TimeSpan.days(1));
        expect(yesterday.dayOfMonth).toEqual(31);
        expect(yesterday.month).toEqual(12);
        expect(yesterday.year).toEqual(2020);
    });

    test("add a time span to a date", () => {
        const now = PosixDate.from({
            year: 2020,
            month: 12,
            dayOfMonth: 31,
        });
        const tomorrow = now.add(TimeSpan.days(1));
        expect(tomorrow.dayOfMonth).toEqual(1);
        expect(tomorrow.month).toEqual(1);
        expect(tomorrow.year).toEqual(2021);
    });

    test("get the start of the day", () => {
        const now = PosixDate.from({
            year: 2020,
            month: 12,
            dayOfMonth: 31,
            hours: 12,
            minutes: 30,
            seconds: 45,
            milliseconds: 123,
        });
        const startOfDay = now.startOfDay();
        expect(startOfDay.dayOfMonth).toEqual(31);
        expect(startOfDay.month).toEqual(12);
        expect(startOfDay.year).toEqual(2020);
        expect(startOfDay.hours).toEqual(0);
        expect(startOfDay.minutes).toEqual(0);
        expect(startOfDay.seconds).toEqual(0);
        expect(startOfDay.milliseconds).toEqual(0);
    });

    test("get the start of the next day", () => {
        const now = PosixDate.from({
            year: 2020,
            month: 12,
            dayOfMonth: 31,
            hours: 12,
            minutes: 30,
            seconds: 45,
            milliseconds: 123,
        });
        const startOfNextDay = now.startOfNextDay();
        expect(startOfNextDay.dayOfMonth).toEqual(1);
        expect(startOfNextDay.month).toEqual(1);
        expect(startOfNextDay.year).toEqual(2021);
        expect(startOfNextDay.hours).toEqual(0);
        expect(startOfNextDay.minutes).toEqual(0);
        expect(startOfNextDay.seconds).toEqual(0);
        expect(startOfNextDay.milliseconds).toEqual(0);
    });
});
