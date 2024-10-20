import { describe, expect, test } from "@fabric/testing";
import { isUUID } from "./is-uuid.ts";

describe("isUUID", () => {
  test("should return true for a valid UUID", () => {
    const validUUID = "123e4567-e89b-12d3-a456-426614174000";
    expect(isUUID(validUUID)).toBe(true);
  });

  test("should return true for a valid UUID with uppercase letters", () => {
    const validUUID = "123E4567-E89B-12D3-A456-426614174000";
    expect(isUUID(validUUID)).toBe(true);
  });

  test("should return true for a nil UUID", () => {
    const nilUUID = "00000000-0000-0000-0000-000000000000";
    expect(isUUID(nilUUID)).toBe(true);
  });

  test("should return true for a max UUID", () => {
    const maxUUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";
    expect(isUUID(maxUUID)).toBe(true);
  });

  test("should return false for an invalid UUID", () => {
    const invalidUUID = "123e4567-e89b-12d3-a456-42661417400";
    expect(isUUID(invalidUUID)).toBe(false);
  });

  test("should return false for a string that is not a UUID", () => {
    const notUUID = "not-a-uuid";
    expect(isUUID(notUUID)).toBe(false);
  });

  test("should return false for a number", () => {
    const number = 1234567890;
    expect(isUUID(number)).toBe(false);
  });

  test("should return false for a boolean", () => {
    const boolean = true;
    expect(isUUID(boolean)).toBe(false);
  });

  test("should return false for null", () => {
    const nullValue = null;
    expect(isUUID(nullValue)).toBe(false);
  });

  test("should return false for undefined", () => {
    const undefinedValue = undefined;
    expect(isUUID(undefinedValue)).toBe(false);
  });
});
