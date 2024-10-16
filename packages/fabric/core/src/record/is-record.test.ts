import { describe, expect, test } from "@fabric/testing";
import { isRecord } from "./is-record.ts";

describe("isRecord", () => {
  test("Given an empty object, it should return true", () => {
    const obj = { name: "John", age: 30 };
    expect(isRecord(obj)).toBe(true);
  });

  test("Given an array, it should return false", () => {
    const arr = [1, 2, 3];
    expect(isRecord(arr)).toBe(false);
  });

  test("Given a number, it should return false", () => {
    const value = null;
    expect(isRecord(value)).toBe(false);
  });

  test("Given a string, it should return false", () => {
    const value = "Hello";
    expect(isRecord(value)).toBe(false);
  });
});
