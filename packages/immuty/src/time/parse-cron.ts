/* eslint-disable @typescript-eslint/no-throw-literal */
import { createRange } from "../collections/create-range.js";
import { Result, createTaggedError } from "../index.js";

//Cron format
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

export interface CronDefinition {
    seconds: number[] | "*";
    minutes: number[] | "*";
    hours: number[] | "*";
    dayOfMonth: number[] | "*";
    month: number[] | "*";
    dayOfWeek: number[] | "*";
}

export const InvalidCronError = createTaggedError("CronDefinitionError");
export type InvalidCronError = ReturnType<typeof InvalidCronError>;

export function parseCron(
    cron: string
): Result<CronDefinition, InvalidCronError> {
    const splitted = cron.split(" ").toReversed();

    if (splitted.length < 5 || splitted.length > 6) {
        return Result.error(
            InvalidCronError(`Expected 5 or 6 parts, got ${splitted.length}.`)
        );
    }

    const [week, month, day, hour, minute, second] = splitted;

    try {
        const parsed: CronDefinition = {
            seconds: parseCronPart(second, partTypes.second),
            minutes: parseCronPart(minute, partTypes.minute),
            hours: parseCronPart(hour, partTypes.hour),
            dayOfMonth: parseCronPart(day, partTypes.dayOfMonth),
            month: parseCronPart(month, partTypes.month),
            dayOfWeek: parseCronPart(week, partTypes.dayOfWeek),
        };

        return Result.ok(parsed);
    } catch (err) {
        return Result.error(err as InvalidCronError);
    }
}

function parseCronPart(
    part: string | undefined,
    { name, min, max, defaultValue }: CronPartType
): number[] | "*" {
    if (!part) {
        if (defaultValue !== undefined) return [defaultValue];
        else {
            throw InvalidCronError(
                `Expected a number or a wildcard, got empty string in "${name}".`
            );
        }
    }

    if (part === "*") {
        return part;
    }

    if (part.includes("/")) {
        const [rangeString, stepString] = part.split("/");

        const parsedStep = parseInt(stepString);

        if (isNaN(parsedStep)) {
            throw InvalidCronError(
                `Expected a number in step part of "${name}", got ${stepString}.`
            );
        }

        if (parsedStep < 1 || parsedStep > max) {
            throw InvalidCronError(
                `Expected a number between 1 and ${max} in step part of "${name}", got ${parsedStep}.`
            );
        }

        if (!rangeString || rangeString === "*") {
            return createRange(0, max, parsedStep);
        }

        const parsedNumRange = parseCronNumberRangePart(rangeString, {
            name,
            min,
            max,
        });

        return parsedNumRange.filter((_, i) => i % parsedStep === 0);
    }

    return parseCronNumberRangePart(part, { name, min, max });
}

function parseCronNumberRangePart(
    part: string,
    { name, min, max }: CronPartType
) {
    if (part.includes(",")) {
        return part
            .split(",")
            .map((p) => parseCronNumberPart(p, { name, min, max }));
    }

    if (part.includes("-")) {
        const [start, end] = part.split("-");
        const parsedStart = parseCronNumberPart(start, { name, min, max });
        const parsedEnd = parseCronNumberPart(end, { name, min, max });

        if (parsedStart > parsedEnd) {
            throw InvalidCronError(
                `Expected a number between ${min} and ${max} in "${name}", got ${parsedStart}-${parsedEnd}.`
            );
        }

        return createRange(parsedStart, parsedEnd);
    }

    return [parseCronNumberPart(part, { name, min, max })];
}

function parseCronNumberPart(part: string, { name, min, max }: CronPartType) {
    const parsed = parseInt(part);

    if (isNaN(parsed)) {
        throw InvalidCronError(
            `Expected a number or a wildcard, got "${part}" in "${name}".`
        );
    }

    if (parsed < min || parsed > max) {
        throw InvalidCronError(
            `Expected a number between ${min} and ${max} in "${name}", got ${parsed}.`
        );
    }

    if (name === "dayOfWeek" && parsed === 7) {
        // 7 is Sunday in cron as well 0
        return 0;
    }

    return parsed;
}

interface CronPartType {
    name: string;
    min: number;
    max: number;
    defaultValue?: number;
}

const partTypes = {
    second: { name: "second", min: 0, max: 59, defaultValue: 0 },
    minute: { name: "minute", min: 0, max: 59 },
    hour: { name: "hour", min: 0, max: 23 },
    dayOfMonth: { name: "dayOfMonth", min: 1, max: 31 },
    month: { name: "month", min: 1, max: 12 },
    dayOfWeek: { name: "dayOfWeek", min: 0, max: 7 },
} satisfies Record<string, CronPartType>;
