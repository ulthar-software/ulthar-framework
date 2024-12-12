import { describe, expect, test } from "@fabric/testing";
import { Option } from "./option.ts";

describe("Option", () => {
  test("Option.some should create an Option with a value", () => {
    const option = Option.some(42);
    expect(option.isValue()).toBe(true);
    expect(option.value).toBe(42);
  });

  test("Option.none should create an Option with no value", () => {
    const option = Option.none();
    expect(option.isNothing()).toBe(true);
    expect(option.value).toBe(null);
  });

  test("Option.from should create an Option with a value if the value is not null or undefined", () => {
    const option = Option.from(42);
    expect(option.isValue()).toBe(true);
    expect(option.value).toBe(42);
  });

  test("Option.from should create an Option with no value if the value is null", () => {
    const option = Option.from(null);
    expect(option.isNothing()).toBe(true);
    expect(option.value).toBe(null);
  });

  test("Option.from should create an Option with no value if the value is undefined", () => {
    const option = Option.from(undefined);
    expect(option.isNothing()).toBe(true);
    expect(option.value).toBe(null);
  });

  test("Option.map should map a value to a new value if the Option has a value", () => {
    const option = Option.some(42).map((value) => value * 2);
    expect(option.isValue()).toBe(true);
    expect(option.value).toBe(84);
  });

  test("Option.map should return the same Option if the Option has no value", () => {
    const option = Option.none<number>().map((value) => value * 2);
    expect(option.isNothing()).toBe(true);
    expect(option.value).toBe(null);
  });

  test("Option.flatMap should map a value to a new Option if the Option has a value", () => {
    const option = Option.some(42).flatMap((value) => Option.some(value * 2));
    expect(option.isValue()).toBe(true);
    expect(option.value).toBe(84);
  });

  test("Option.flatMap should return the same Option if the Option has no value", () => {
    const option = Option.none<number>().flatMap((value) =>
      Option.some(value * 2)
    );
    expect(option.isNothing()).toBe(true);
    expect(option.value).toBe(null);
  });

  test("Option.match should return the result of the some function if the Option has a value", () => {
    const option = Option.some(42);
    const result = option.match({
      some: (value) => value * 2,
      none: () => 0,
    });
    expect(result).toBe(84);
  });

  test("Option.match should return the result of the none function if the Option has no value", () => {
    const option = Option.none<number>();
    const result = option.match({
      some: (value) => value * 2,
      none: () => 0,
    });
    expect(result).toBe(0);
  });
});
