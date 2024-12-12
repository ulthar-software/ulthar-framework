import { describe, expect, test } from "@fabric/testing";
import { fnMock } from "./fn-mock.ts";
import { partialMock } from "./partial-mock.ts";

describe("partialMock", () => {
  test("given a function, should create a mock with the function", () => {
    const mockFn = fnMock(() => "mocked");
    const mock = partialMock<{ myMethod: () => string }>({
      myMethod: mockFn,
    });

    expect(mock.myMethod()).toBe("mocked");
    expect(mockFn).toHaveBeenCalled();
  });

  test("given a property, should create a mock with the property", () => {
    const mock = partialMock<{ myProp: string }>({
      myProp: "mocked",
    });

    expect(mock.myProp).toBe("mocked");
  });

  test(
    "given a type with multiple properties, should create a mock with only some properties",
    () => {
      const mock = partialMock<{ myMethod: () => string; myProp: string }>({
        myProp: "mocked",
      });

      expect(mock.myProp).toBe("mocked");
    },
  );
});
