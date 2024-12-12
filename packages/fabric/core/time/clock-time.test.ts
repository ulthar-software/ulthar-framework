import { describe, expect, test } from "@fabric/testing";
import { ClockTime, ClockTimeParsingError } from "./clock-time.ts";

describe("ClockTime", () => {
  test("constructor should initialize hours, minutes, and seconds to 0 if no arguments are provided", () => {
    const time = new ClockTime();
    expect(time.hours).toBe(0);
    expect(time.minutes).toBe(0);
    expect(time.seconds).toBe(0);
  });

  test("constructor should initialize hours, minutes, and seconds to provided values", () => {
    const time = new ClockTime(1, 2, 3);
    expect(time.hours).toBe(1);
    expect(time.minutes).toBe(2);
    expect(time.seconds).toBe(3);
  });

  test("toString should return the time in the format 'hours:minutes:seconds'", () => {
    const time = new ClockTime(1, 2, 3);
    expect(time.toString()).toBe("1:2:3");
  });

  test("fromString should return a ClockTime instance for valid time strings", () => {
    const result = ClockTime.fromString("1:2:3");
    expect(result.isOk()).toBe(true);
    const time = result.unwrapOrThrow();
    expect(time.hours).toBe(1);
    expect(time.minutes).toBe(2);
    expect(time.seconds).toBe(3);
  });

  test("fromString should return a ClockTimeParsingError for invalid time strings", () => {
    const result = ClockTime.fromString("invalid");
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(ClockTimeParsingError);
    expect(error.message).toBe("Invalid time format: invalid");
  });

  test("fromString should return a ClockTimeParsingError for time strings with non-numeric values", () => {
    const result = ClockTime.fromString("1:two:3");
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(ClockTimeParsingError);
    expect(error.message).toBe("Invalid time format: 1:two:3");
  });

  test("fromString should return a ClockTimeParsingError for time strings with incorrect format", () => {
    const result = ClockTime.fromString("1:2");
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(ClockTimeParsingError);
    expect(error.message).toBe("Invalid time format: 1:2");
  });
});
