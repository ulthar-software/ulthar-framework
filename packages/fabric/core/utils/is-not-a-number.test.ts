import { describe, expect, test } from "@fabric/testing";
import { isNotANumber } from "./is-not-a-number.ts";

describe("Is not a number", () => {
  test("Given a number it should return false", () => {
    expect(isNotANumber(1)).toBe(false);
  });

  test("Given a string it should return true", () => {
    expect(isNotANumber("a")).toBe(true);
  });

  test("Given a string number it should return false", () => {
    expect(isNotANumber("5")).toBe(false);
  });

  test("Given an empty string it should return true", () => {
    expect(isNotANumber("")).toBe(true);
  });

  test("Given a boolean it should return true", () => {
    expect(isNotANumber(true)).toBe(true);
  });

  test("Given an object it should return true", () => {
    expect(isNotANumber({})).toBe(true);
  });

  test("Given an array it should return true", () => {
    expect(isNotANumber([])).toBe(true);
  });

  test("Given a null it should return true", () => {
    expect(isNotANumber(null)).toBe(true);
  });

  test("Given an undefined it should return true", () => {
    expect(isNotANumber(undefined)).toBe(true);
  });
});
