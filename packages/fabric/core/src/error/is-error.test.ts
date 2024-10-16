import { describe, expect, expectTypeOf, test } from "@fabric/testing";
import { isError } from "./is-error.ts";
import { UnexpectedError } from "./unexpected-error.ts";

describe("is-error", () => {
  test("Given a value that is an error, it should return true", () => {
    const error = new UnexpectedError();

    expect(isError(error)).toBe(true);

    //After a check, typescript should be able to infer the type
    if (isError(error)) {
      expectTypeOf(error).toEqualTypeOf<UnexpectedError>();
    }
  });
});
