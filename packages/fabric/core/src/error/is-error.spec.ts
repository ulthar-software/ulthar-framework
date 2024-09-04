import { describe, expect, expectTypeOf, it } from "vitest";
import { Result } from "../result/result.js";
import { isError } from "./is-error.js";
import { TaggedError } from "./tagged-error.js";

describe("is-error", () => {
  it("should determine if a value is an error", () => {
    type DemoResult = Result<number, TaggedError<"DemoError">>;

    //Ok should not be an error
    const ok: DemoResult = 42;
    expect(isError(ok)).toBe(false);

    //Error should be an error
    const error: DemoResult = new TaggedError("DemoError");
    expect(isError(error)).toBe(true);

    //After a check, typescript should be able to infer the type
    if (isError(error)) {
      expectTypeOf(error).toEqualTypeOf<TaggedError<"DemoError">>();
    }
  });
});
