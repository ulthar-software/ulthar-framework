import { TaggedError } from "../error/tagged-error.ts";
import { Result } from "../result/result.ts";

/**
 * Represents a time of day in hours, minutes, and seconds.
 */
export class ClockTime {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;

  constructor(hours?: number, minutes?: number, seconds?: number) {
    this.hours = hours ?? 0;
    this.minutes = minutes ?? 0;
    this.seconds = seconds ?? 0;
  }

  toString() {
    return `${this.hours}:${this.minutes}:${this.seconds}`;
  }

  static fromString(time: string): Result<ClockTime, ClockTimeParsingError> {
    const splitArray = time.split(":");
    if (splitArray.length != 3) {
      return Result.failWith(
        new ClockTimeParsingError(`Invalid time format: ${time}`),
      );
    }
    const [hours, minutes, seconds] = splitArray.map(Number);
    if (isNaN(hours!) || isNaN(minutes!) || isNaN(seconds!)) {
      return Result.failWith(
        new ClockTimeParsingError(`Invalid time format: ${time}`),
      );
    }
    return Result.ok(new ClockTime(hours, minutes, seconds));
  }
}

export class ClockTimeParsingError
  extends TaggedError<"ClockTimeParsingError"> {
  constructor(message: string) {
    super("ClockTimeParsingError", message);
  }
}
