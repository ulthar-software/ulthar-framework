import { PosixDate } from "./posix-date.js";
import { TimeSpan } from "./time-span.js";
import { Time } from "./time.js";

describe("Time Span", () => {
    beforeAll(() => {
        Time.useFakeTime();
    });
    afterAll(() => {
        Time.useRealTime();
    });

    it("should describe a time span", () => {
        expect(TimeSpan.milliseconds(1000).toSeconds()).toEqual(1);
    });

    it("should describe a time span in minutes", () => {
        expect(TimeSpan.minutes(5).toMinutes()).toEqual(5);
    });

    it("should describe a time span in hours", () => {
        expect(TimeSpan.hours(2).toHours()).toEqual(2);
    });

    it("should describe a time span in days", () => {
        expect(TimeSpan.days(2).toDays()).toEqual(2);
    });

    it("should sleep the correct amount of time", async () => {
        Time.useFakeTime();
        const now = Time.now();
        await TimeSpan.seconds(1).sleep();
        expect(Time.now()).toEqual(now + 1000);
    });

    it("should subtract time spans", async () => {
        expect(
            TimeSpan.seconds(2).subtract(TimeSpan.seconds(1)).toSeconds()
        ).toEqual(1);
    });

    it("should add time spans", async () => {
        expect(
            TimeSpan.seconds(1).add(TimeSpan.seconds(1)).toSeconds()
        ).toEqual(2);
    });

    it("should create a time span from two posix dates", async () => {
        const start = PosixDate.now();
        const end = PosixDate.now().add(TimeSpan.seconds(1));

        expect(TimeSpan.fromDifference(start, end).toSeconds()).toEqual(1);
    });

    test("create a span from various units at the same time", () => {
        const span1 = TimeSpan.from({
            days: 1,
            hours: 2,
            minutes: 3,
            seconds: 4,
        });

        expect(span1.toMilliseconds()).toEqual(93784000);

        const span2 = TimeSpan.from({
            days: 1,
            hours: 2,
            minutes: 3,
        });

        expect(span2.toMilliseconds()).toEqual(93780000);

        const span3 = TimeSpan.from({
            days: 1,
            hours: 2,
        });

        expect(span3.toMilliseconds()).toEqual(93600000);

        const span4 = TimeSpan.from({
            days: 1,
        });

        expect(span4.toMilliseconds()).toEqual(86400000);

        const span5 = TimeSpan.from({
            hours: 2,
        });

        expect(span5.toMilliseconds()).toEqual(7200000);
    });
});
