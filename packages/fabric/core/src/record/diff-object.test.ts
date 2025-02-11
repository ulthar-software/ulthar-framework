import { describe, expect, test } from "@fabric/testing";
import { diffObject } from "./diff-object.js";

describe("diffObject", () => {
  test("given identical objects, should return empty diff object", () => {
    const initialObject = { a: 1, b: 2 };
    const targetObject = { a: 1, b: 2 };

    const diff = diffObject(initialObject, targetObject);

    expect(diff).toEqual({
      set: {},
      remove: [],
    });
  });

  test("given objects with added values, should return a diff object with the new values", () => {
    const initialObject = { a: 1, b: 2 };
    const targetObject = { a: 1, b: 3 };

    const diff = diffObject(initialObject, targetObject);

    expect(diff).toEqual({
      set: {
        b: 3,
      },
      remove: [],
    });
  });

  test("given objects with removed values, should return a diff object with the removed keys", () => {
    const initialObject = { a: 1, b: 2 };
    const targetObject = { a: 1 };

    const diff = diffObject(initialObject, targetObject);

    expect(diff).toEqual({
      set: {},
      remove: ["b"],
    });
  });

  test("given objects with added and removed values, should return a diff object with the new values and removed keys", () => {
    interface TestType {
      a: number;
      b?: number;
      c?: number;
    }
    const initialObject: TestType = { a: 1, b: 2 };
    const targetObject: TestType = { a: 2, c: 3 };

    const diff = diffObject(initialObject, targetObject);

    expect(diff).toEqual({
      set: {
        a: 2,
        c: 3,
      },
      remove: ["b"],
    });
  });

  test("given objects with changed values, should return a diff object with the new values", () => {
    const initialObject = { a: 1, b: 2 };
    const targetObject = { a: 2, b: 3 };

    const diff = diffObject(initialObject, targetObject);

    expect(diff).toEqual({
      set: {
        a: 2,
        b: 3,
      },
      remove: [],
    });
  });
});
