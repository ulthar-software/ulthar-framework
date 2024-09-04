import { describe, expect, it } from "vitest";
import { isRecord } from "./is-record.js";

describe("isRecord", () => {
  it("should return true for an object", () => {
    const obj = { name: "John", age: 30 };
    expect(isRecord(obj)).toBe(true);
  });

  it("should return false for an array", () => {
    const arr = [1, 2, 3];
    expect(isRecord(arr)).toBe(false);
  });

  it("should return false for null", () => {
    const value = null;
    expect(isRecord(value)).toBe(false);
  });

  it("should return false for a string", () => {
    const value = "Hello";
    expect(isRecord(value)).toBe(false);
  });
});
