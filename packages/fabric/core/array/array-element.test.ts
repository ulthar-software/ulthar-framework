import { describe, expectTypeOf, test } from "@fabric/testing";
import type {
  ArrayElement,
  TupleFirstElement,
  TupleLastElement,
} from "./array-element.ts";

describe("ArrayElement", () => {
  test("Given an array, it should return the element type of the array", () => {
    type result = ArrayElement<["a", "b", "c"]>;
    expectTypeOf<result>().toEqualTypeOf<"a" | "b" | "c">();
  });

  test("Given an array of numbers, it should return the element type of the array", () => {
    type result = ArrayElement<[1, 2, 3]>;
    expectTypeOf<result>().toEqualTypeOf<1 | 2 | 3>();
  });

  test("Given an empty array, it should return never", () => {
    type result = ArrayElement<[]>;
    expectTypeOf<result>().toEqualTypeOf<never>();
  });
});

describe("TupleFirstElement", () => {
  test("Given a tuple, it should return the first element type of the tuple", () => {
    type result = TupleFirstElement<[1, 2, 3]>;
    expectTypeOf<result>().toEqualTypeOf<1>();
  });

  test("Given a tuple with different types, it should return the first element type of the tuple", () => {
    type result = TupleFirstElement<[string, number, boolean]>;
    expectTypeOf<result>().toEqualTypeOf<string>();
  });

  test("Given an empty tuple, it should return never", () => {
    type result = TupleFirstElement<[]>;
    expectTypeOf<result>().toEqualTypeOf<never>();
  });
});

describe("TupleLastElement", () => {
  test("Given a tuple, it should return the last element type of the tuple", () => {
    type result = TupleLastElement<[1, 2, 3]>;
    expectTypeOf<result>().toEqualTypeOf<3>();
  });

  test("Given a tuple with different types, it should return the last element type of the tuple", () => {
    type result = TupleLastElement<[string, number, boolean]>;
    expectTypeOf<result>().toEqualTypeOf<boolean>();
  });

  test("Given an empty tuple, it should return never", () => {
    type result = TupleLastElement<[]>;
    expectTypeOf<result>().toEqualTypeOf<never>();
  });
});
