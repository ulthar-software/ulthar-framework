import { describe, expect, test } from "@fabric/testing";
import { hours, minutes, ms, seconds } from "./time-constants.ts";

describe("time-constants", () => {
  test("ms should return the same number of milliseconds", () => {
    expect(ms(1000)).toBe(1000);
    expect(ms(0)).toBe(0);
    expect(ms(-1000)).toBe(-1000);
  });

  test("seconds should convert seconds to milliseconds", () => {
    expect(seconds(1)).toBe(1000);
    expect(seconds(0)).toBe(0);
    expect(seconds(-1)).toBe(-1000);
  });

  test("minutes should convert minutes to milliseconds", () => {
    expect(minutes(1)).toBe(60000);
    expect(minutes(0)).toBe(0);
    expect(minutes(-1)).toBe(-60000);
  });

  test("hours should convert hours to milliseconds", () => {
    expect(hours(1)).toBe(3600000);
    expect(hours(0)).toBe(0);
    expect(hours(-1)).toBe(-3600000);
  });
});
