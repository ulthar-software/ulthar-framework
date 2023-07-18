import { cronNextSpan } from "./cron-next-span.js";
import { parseCron } from "./parse-cron.js";
import { PosixDate } from "./posix-date.js";
import { Time } from "./time.js";

describe("Next Cron Time Span", () => {
    beforeAll(() => {
        Time.useFakeTime();
    });
    afterAll(() => {
        Time.useRealTime();
    });
    test.each([
        [
            "* * * * *", // every minute
            PosixDate.from({ dayOfMonth: 1, hours: 0 }),
            PosixDate.from({ dayOfMonth: 1, hours: 0, minutes: 1 }),
        ],
        [
            "/5 * * * *", // every 5 minutes
            PosixDate.from({ dayOfMonth: 1, hours: 0 }),
            PosixDate.from({ dayOfMonth: 1, hours: 0, minutes: 5 }),
        ],
        [
            "0 0 * * *", // every hour
            PosixDate.from({ dayOfMonth: 1, hours: 0 }),
            PosixDate.from({ dayOfMonth: 2, hours: 0 }),
        ],
        [
            "0 0 1 * *", // every month
            PosixDate.from({ month: 1, dayOfMonth: 1, hours: 0 }),
            PosixDate.from({ month: 2, dayOfMonth: 1, hours: 0 }),
        ],
        [
            "0 0 * * 1", // every Monday
            PosixDate.from({ year: 2021, month: 1, dayOfMonth: 1 }),
            PosixDate.from({ year: 2021, month: 1, dayOfMonth: 4 }),
        ],
        [
            "0 0 * * 7", // every Sunday
            PosixDate.from({ year: 2021, month: 1, dayOfMonth: 1 }),
            PosixDate.from({ year: 2021, month: 1, dayOfMonth: 3 }),
        ],
        [
            "0 0 1 * 1", // day-of-month 1 and on Monday.
            PosixDate.from({ year: 2021, month: 1, dayOfMonth: 2 }),
            PosixDate.from({ year: 2021, month: 1, dayOfMonth: 4 }),
        ],
        [
            "0 0 1 * 1", // day-of-month 1 and on Monday.
            PosixDate.from({ year: 2021, month: 3, dayOfMonth: 30 }),
            PosixDate.from({ year: 2021, month: 4, dayOfMonth: 1 }),
        ],
        [
            "0 0 1 1 *", // first day of the year
            PosixDate.from({ year: 2021, month: 8, dayOfMonth: 1, hours: 0 }),
            PosixDate.from({ year: 2022, month: 1, dayOfMonth: 1, hours: 0 }),
        ],
        [
            "0 0 1 12 *", // first day of December
            PosixDate.from({ year: 2021, month: 8, dayOfMonth: 1, hours: 0 }),
            PosixDate.from({ year: 2021, month: 12, dayOfMonth: 1, hours: 0 }),
        ],
        [
            "/20 * * * *",
            PosixDate.from({ hours: 12, minutes: 1 }),
            PosixDate.from({ hours: 12, minutes: 20 }),
        ],
        [
            "23 0-20/2 * * *",
            PosixDate.from({ hours: 12 }),
            PosixDate.from({ hours: 12, minutes: 23 }),
        ],
        [
            "23 0-20/2 * * *",
            PosixDate.from({ hours: 12, minutes: 24 }),
            PosixDate.from({ hours: 14, minutes: 23 }),
        ],
        [
            "23 0-20/2 * * *",
            PosixDate.from({ dayOfMonth: 1, hours: 20, minutes: 24 }),
            PosixDate.from({ dayOfMonth: 2, hours: 0, minutes: 23 }),
        ],
        [
            "5 0 * 8 *",
            PosixDate.from({ month: 7, dayOfMonth: 20, hours: 12 }),
            PosixDate.from({ month: 8, dayOfMonth: 1, hours: 0, minutes: 5 }),
        ],
        [
            "5 0 * 8 *",
            PosixDate.from({ year: 2020, month: 9, dayOfMonth: 20, hours: 12 }),
            PosixDate.from({
                year: 2021,
                month: 8,
                dayOfMonth: 1,
                hours: 0,
                minutes: 5,
            }),
        ],
        [
            "22 * * * * *",
            PosixDate.from({ seconds: 12 }),
            PosixDate.from({ seconds: 22 }),
        ],
        [
            "22 * * * * *",
            PosixDate.from({ minutes: 1, seconds: 24 }),
            PosixDate.from({ minutes: 2, seconds: 22 }),
        ],
    ])(
        `should return the correct time span for each cron expression`,
        (cronExpression, now, nextDate) => {
            const cronResult = parseCron(cronExpression);
            if (cronResult.isError())
                throw new Error("Expected cron to be valid");
            const cron = cronResult.unwrap();

            const nextSpan = cronNextSpan(now, cron);

            expect(now.add(nextSpan)).toEqual(nextDate);
        }
    );
});
