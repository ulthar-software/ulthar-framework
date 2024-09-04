import { describe, expectTypeOf, test } from "vitest";

describe("ArrayElement utils", () => {
  test("Given an array, it should return the element type of the array", () => {
    type ArrayElement<T extends readonly unknown[]> =
      T extends readonly (infer U)[] ? U : never;

    type result = ArrayElement<["a", "b", "c"]>;

    expectTypeOf<result>().toEqualTypeOf<"a" | "b" | "c">();
  });
});
