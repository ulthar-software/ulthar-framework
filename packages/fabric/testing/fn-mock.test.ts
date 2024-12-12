import { describe, expect, test } from "@fabric/testing";
import { fnMock } from "./fn-mock.ts";

describe("fnMock", () => {
  test("should create a mock function", () => {
    const mockFn = fnMock(() => "test");

    expect(mockFn()).toBe("test");
  });

  test("should call the mock function with correct arguments", () => {
    const mockFn = fnMock((a: number, b: number) => a + b);

    const result = mockFn(1, 2);

    expect(result).toBe(3);
  });

  test("should return undefined when no mock implementation is provided", () => {
    const mockFn = fnMock();

    expect(mockFn()).toBeUndefined();
  });

  test("should be able to mock a function with multiple calls", () => {
    const mockFn = fnMock((a: number) => a * 2);

    expect(mockFn(2)).toBe(4);
    expect(mockFn(3)).toBe(6);
  });
});
