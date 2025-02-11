import { describe, expectTypeOf, test } from "@fabric/testing";
import type {
  ArrayElement,
  TupleFirstElement,
  TupleLastElement,
} from "./array-element.js";

describe("ArrayElement", () => {
  test("Given an array, it should return the element type of the array", () => {
    type Result = ArrayElement<["a", "b", "c"]>;
    expectTypeOf<Result>().toEqualTypeOf<"a" | "b" | "c">();
  });

  test("Given an array of numbers, it should return the element type of the array", () => {
    type Result = ArrayElement<[1, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<1 | 2 | 3>();
  });

  test("Given an empty array, it should return never", () => {
    type Result = ArrayElement<[]>;
    expectTypeOf<Result>().toEqualTypeOf<never>();
  });
});

describe("TupleFirstElement", () => {
  test("Given a tuple, it should return the first element type of the tuple", () => {
    type Result = TupleFirstElement<[1, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<1>();
  });

  test("Given a tuple with different types, it should return the first element type of the tuple", () => {
    type Result = TupleFirstElement<[string, number, boolean]>;
    expectTypeOf<Result>().toEqualTypeOf<string>();
  });

  test("Given an empty tuple, it should return never", () => {
    type Result = TupleFirstElement<[]>;
    expectTypeOf<Result>().toEqualTypeOf<never>();
  });
});

describe("TupleLastElement", () => {
  test("Given a tuple, it should return the last element type of the tuple", () => {
    type Result = TupleLastElement<[1, 2, 3]>;
    expectTypeOf<Result>().toEqualTypeOf<3>();
  });

  test("Given a tuple with different types, it should return the last element type of the tuple", () => {
    type Result = TupleLastElement<[string, number, boolean]>;
    expectTypeOf<Result>().toEqualTypeOf<boolean>();
  });

  test("Given an empty tuple, it should return never", () => {
    type Result = TupleLastElement<[]>;
    expectTypeOf<Result>().toEqualTypeOf<never>();
  });
});
