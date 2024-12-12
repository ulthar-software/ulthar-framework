import { describe, expect, test } from "@fabric/testing";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { ensure } from "./ensure.ts";

describe("ensure", () => {
  test("should return the value if it is not nullish", () => {
    const value = 42;
    const result = ensure(value);
    expect(result).toBe(42);
  });

  test("should throw an UnexpectedError if the value is null", () => {
    expect(() => ensure(null)).toThrow(UnexpectedError);
    expect(() => ensure(null)).toThrow("Value is nullish.");
  });

  test("should throw an UnexpectedError if the value is undefined", () => {
    expect(() => ensure(undefined)).toThrow(UnexpectedError);
    expect(() => ensure(undefined)).toThrow("Value is nullish.");
  });

  test("should return the value if it is a non-empty string", () => {
    const value = "test";
    const result = ensure(value);
    expect(result).toBe("test");
  });

  test("should throw an UnexpectedError if the value is an empty string", () => {
    expect(() => ensure("")).toThrow(UnexpectedError);
    expect(() => ensure("")).toThrow("Value is nullish.");
  });

  test("should return the value if it is a non-zero number", () => {
    const value = 1;
    const result = ensure(value);
    expect(result).toBe(1);
  });

  test("should throw an UnexpectedError if the value is zero", () => {
    expect(() => ensure(0)).toThrow(UnexpectedError);
    expect(() => ensure(0)).toThrow("Value is nullish.");
  });

  test("should return the value if it is a non-empty array", () => {
    const value = [1, 2, 3];
    const result = ensure(value);
    expect(result).toEqual([1, 2, 3]);
  });

  test("should return the value if it is a non-empty object", () => {
    const value = { key: "value" };
    const result = ensure(value);
    expect(result).toEqual({ key: "value" });
  });
});
