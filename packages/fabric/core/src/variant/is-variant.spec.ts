import { describe, expect, expectTypeOf, it } from "vitest";
import { isVariant } from "./is-variant.js";
import { TaggedVariant, VariantTag } from "./variant.js";

interface SuccessVariant extends TaggedVariant<"success"> {
  [VariantTag]: "success";
  data: string;
}

interface ErrorVariant extends TaggedVariant<"error"> {
  [VariantTag]: "error";
  message: string;
}

describe("isVariant", () => {
  const successVariant = {
    [VariantTag]: "success",
    data: "Operation successful",
  } as SuccessVariant | ErrorVariant;

  const errorVariant = {
    [VariantTag]: "error",
    message: "Operation failed",
  } as SuccessVariant | ErrorVariant;

  it("should return true for a matching tag and correctly infer it", () => {
    if (isVariant(successVariant, "success")) {
      expectTypeOf(successVariant).toEqualTypeOf<SuccessVariant>();
    }

    if (isVariant(errorVariant, "error")) {
      expectTypeOf(errorVariant).toEqualTypeOf<ErrorVariant>();
    }
  });

  it("should return false for a non-matching tag", () => {
    expect(isVariant(successVariant, "error")).toBe(false);
    expect(isVariant(errorVariant, "success")).toBe(false);
  });
});
