import { Result } from "../index.js";
import { InvalidCronError, parseCron } from "./parse-cron.js";

describe("cron-parser", () => {
    test.each([
        [
            "0 0 0 * * *", //every day at midnight
            {
                seconds: [0],
                minutes: [0],
                hours: [0],
                dayOfMonth: "*",
                month: "*",
                dayOfWeek: "*",
            },
        ],
        [
            "0 0 0 * * 1", //every Monday at midnight
            {
                seconds: [0],
                minutes: [0],
                hours: [0],
                dayOfMonth: "*",
                month: "*",
                dayOfWeek: [1],
            },
        ],
        [
            "0 0 0 1 * *", //every 1st of the month at midnight
            {
                seconds: [0],
                minutes: [0],
                hours: [0],
                dayOfMonth: [1],
                month: "*",
                dayOfWeek: "*",
            },
        ],
        [
            "0 0 1 1 *", //every 1st of January at midnight
            {
                seconds: [0],
                minutes: [0],
                hours: [0],
                dayOfMonth: [1],
                month: [1],
                dayOfWeek: "*",
            },
        ],
    ])("should parse a simple cron expression", (cron, parsedValue) => {
        const parsed = parseCron(cron);

        expect(parsed).toEqual(Result.ok(parsedValue));
    });

    test.each([
        [
            "    ",
            'Expected a number or a wildcard, got empty string in "minute".',
        ],
        ["0 0 0 1 1 1 1", "Expected 5 or 6 parts, got 7."],
        ["0 0 1 1", "Expected 5 or 6 parts, got 4."],
        ["0 0 0 1 1 1 1 1", "Expected 5 or 6 parts, got 8."],
        [
            "banana 0 0 1 1 1",
            'Expected a number or a wildcard, got "banana" in "second".',
        ],
        [
            "0 96 0 1 1 1",
            'Expected a number between 0 and 59 in "minute", got 96.',
        ],
        [
            "0 0 0 1 0 1",
            'Expected a number between 1 and 12 in "month", got 0.',
        ],
        [
            "23 /banana * * *",
            'Expected a number in step part of "hour", got banana.',
        ],
        [
            "23 /32 * * *",
            'Expected a number between 1 and 23 in step part of "hour", got 32.',
        ],
        [
            "23 15-6 * * *",
            'Expected a number between 0 and 23 in "hour", got 15-6.',
        ],
    ])(
        "should return an error if the cron expression is invalid",
        (cron, errorMessage) => {
            const parsed = parseCron(cron);

            expect(parsed).toEqual(
                Result.error(new InvalidCronError(errorMessage))
            );
        }
    );

    test.each([
        [
            "0 22 * * 1-5", //every weekday at 22:00
            {
                seconds: [0],
                minutes: [0],
                hours: [22],
                dayOfMonth: "*",
                month: "*",
                dayOfWeek: [1, 2, 3, 4, 5],
            },
        ],
        [
            "0 0,12 1 * *", //every 1st of the month at midnight and noon
            {
                seconds: [0],
                minutes: [0],
                hours: [0, 12],
                dayOfMonth: [1],
                month: "*",
                dayOfWeek: "*",
            },
        ],
        [
            "0 0-20/2 * * *", //every even hour until 20:00
            {
                seconds: [0],
                minutes: [0],
                hours: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
                dayOfMonth: "*",
                month: "*",
                dayOfWeek: "*",
            },
        ],
        [
            "23 /2 * * *", //every even hour at 23 minutes
            {
                seconds: [0],
                minutes: [23],
                hours: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
                dayOfMonth: "*",
                month: "*",
                dayOfWeek: "*",
            },
        ],
        [
            "23 */2 * * *", //every even hour at 23 minutes
            {
                seconds: [0],
                minutes: [23],
                hours: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
                dayOfMonth: "*",
                month: "*",
                dayOfWeek: "*",
            },
        ],
    ])("should parse a complex cron expression", (cron, parsedValue) => {
        const parsed = parseCron(cron);

        expect(parsed).toEqual(Result.ok(parsedValue));
    });
});
