import { describe, expectTypeOf, test } from "@fabric/testing";
import type { ArrayElement } from "./array-element.ts";

describe("ArrayElement", () => {
  test("Given an array, it should return the element type of the array", () => {
    type result = ArrayElement<["a", "b", "c"]>;

    expectTypeOf<result>().toEqualTypeOf<"a" | "b" | "c">();
  });
});
