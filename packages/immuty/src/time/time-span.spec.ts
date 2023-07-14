import { TimeSpan } from "./time-span.js";
import { Time } from "./time.js";

describe("Time Span", () => {
    afterEach(() => {
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
});
