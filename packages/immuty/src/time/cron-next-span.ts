import { CronDefinition } from "./parse-cron.js";
import { PosixDate } from "./posix-date.js";
import { TimeSpan } from "./time-span.js";

export function cronNextSpan(
    now: PosixDate,
    cronDef: CronDefinition
): TimeSpan {
    let targetDate = now;

    let difference = TimeSpan.milliseconds(0);

    while (true) {
        const nextSeconds = nextCronMatch(targetDate.seconds, cronDef.seconds);
        if (nextSeconds !== targetDate.seconds) {
            targetDate = targetDate.set({
                minutes:
                    nextSeconds < targetDate.seconds
                        ? targetDate.minutes + 1
                        : targetDate.minutes,
                seconds: nextSeconds,
                milliseconds: 0,
            });
            continue;
        }
        const nextMinutes = nextCronMatch(targetDate.minutes, cronDef.minutes);
        if (nextMinutes !== targetDate.minutes) {
            targetDate = targetDate.set({
                hours:
                    nextMinutes < targetDate.minutes
                        ? targetDate.hours + 1
                        : targetDate.hours,
                minutes: nextMinutes,
                seconds: 0,
                milliseconds: 0,
            });
            continue;
        }

        const nextHours = nextCronMatch(targetDate.hours, cronDef.hours);
        if (nextHours !== targetDate.hours) {
            targetDate = targetDate.set({
                dayOfMonth:
                    nextHours < targetDate.hours
                        ? targetDate.dayOfMonth + 1
                        : targetDate.dayOfMonth,
                hours: nextHours < targetDate.hours ? 0 : nextHours,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
            });
            continue;
        }

        const nextDayOfMonth = nextCronMatch(
            targetDate.dayOfMonth,
            cronDef.dayOfMonth
        );
        const nextDayOfWeek = nextCronMatch(
            targetDate.dayOfWeek,
            cronDef.dayOfWeek
        );

        if (cronDef.dayOfMonth !== "*" || cronDef.dayOfWeek !== "*") {
            const prevTargetDate = targetDate;

            if (
                cronDef.dayOfMonth !== "*" &&
                cronDef.dayOfWeek !== "*" &&
                nextDayOfMonth !== targetDate.dayOfMonth &&
                nextDayOfWeek !== targetDate.dayOfWeek
            ) {
                targetDate = setClosestDay(
                    targetDate,
                    nextDayOfMonth,
                    nextDayOfWeek
                );
            } else if (
                cronDef.dayOfMonth !== "*" &&
                cronDef.dayOfWeek === "*" &&
                nextDayOfMonth !== targetDate.dayOfMonth
            ) {
                targetDate = targetDate.set({
                    dayOfMonth: nextDayOfMonth,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                });
            } else if (
                cronDef.dayOfMonth === "*" &&
                cronDef.dayOfWeek !== "*" &&
                nextDayOfWeek !== targetDate.dayOfWeek
            ) {
                targetDate = targetDate.nextWeekDay(nextDayOfWeek);
            }

            if (targetDate.dayOfMonth < prevTargetDate.dayOfMonth) {
                targetDate = targetDate.set({
                    month: targetDate.month + 1,
                    dayOfMonth: 1,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                });
            }

            if (targetDate.notEquals(prevTargetDate)) {
                continue;
            }
        }

        const nextMonth = nextCronMatch(targetDate.month, cronDef.month);
        if (nextMonth !== targetDate.month) {
            targetDate = targetDate.set({
                year:
                    nextMonth < targetDate.month
                        ? targetDate.year + 1
                        : targetDate.year,
                month: nextMonth < targetDate.month ? 1 : nextMonth,
                dayOfMonth: 1,
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
            });
            continue;
        }

        difference = TimeSpan.fromDifference(now, targetDate);
        if (difference.isZero()) {
            targetDate = targetDate.add(TimeSpan.seconds(1));
            continue;
        }
        break;
    }

    return difference;
}

function nextCronMatch(value: number, cronPart: number[] | "*") {
    if (cronPart === "*") return value;
    return cronPart.find((v) => v >= value) ?? cronPart[0];
}

function setClosestDay(
    date: PosixDate,
    dayOfMonth: number,
    dayOfWeek: number
): PosixDate {
    const dayOfMonthDate = date.set({
        dayOfMonth,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
    });
    const dayOfWeekDate = date.nextWeekDay(dayOfWeek);

    if (dayOfMonthDate.dayOfWeek <= dayOfWeekDate.dayOfWeek) {
        return dayOfMonthDate;
    }

    return dayOfWeekDate;
}
