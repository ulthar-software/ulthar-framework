import { describe, expect, test } from "@fabric/testing";
import { isNumber } from "./is-number.ts";

describe("Is a number", () => {
  test("Given a number it should return true", () => {
    expect(isNumber(1)).toBe(true);
  });

  test("Given a string it should return false", () => {
    expect(isNumber("a")).toBe(false);
  });

  test("Given an empty string it should return false", () => {
    expect(isNumber("")).toBe(false);
  });

  test("Given a boolean it should return false", () => {
    expect(isNumber(false)).toBe(false);
  });

  test("Given an object it should return false", () => {
    expect(isNumber({})).toBe(false);
  });

  test("Given an array it should return false", () => {
    expect(isNumber([])).toBe(false);
  });

  test("Given a null it should return false", () => {
    expect(isNumber(null)).toBe(false);
  });

  test("Given an undefined it should return false", () => {
    expect(isNumber(undefined)).toBe(false);
  });
});
