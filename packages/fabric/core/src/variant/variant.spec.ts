import { describe, expect, expectTypeOf, it } from "vitest";
import { TaggedVariant, Variant, VariantTag } from "./variant.js";

interface SuccessVariant extends TaggedVariant<"success"> {
  [VariantTag]: "success";
  data: string;
}

interface ErrorVariant extends TaggedVariant<"error"> {
  [VariantTag]: "error";
  message: string;
}

describe("Variant", () => {
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
      if (Variant.is(successVariant, "success")) {
        expectTypeOf(successVariant).toEqualTypeOf<SuccessVariant>();
      }

      if (Variant.is(errorVariant, "error")) {
        expectTypeOf(errorVariant).toEqualTypeOf<ErrorVariant>();
      }
    });

    it("should return false for a non-matching tag", () => {
      expect(Variant.is(successVariant, "error")).toBe(false);
      expect(Variant.is(errorVariant, "success")).toBe(false);
    });
  });
});
