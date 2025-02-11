import { describe, expect, test } from "@fabric/testing";
import { type TaggedVariant, Variant, VariantTag } from "./variant.js";

interface SuccessVariant extends TaggedVariant<"success"> {
  [VariantTag]: "success";
  data: string;
}

interface ErrorVariant extends TaggedVariant<"error"> {
  [VariantTag]: "error";
  message: string;
}

const successVariant = {
  [VariantTag]: "success",
  data: "Operation successful",
} as SuccessVariant | ErrorVariant;

const errorVariant = {
  [VariantTag]: "error",
  message: "Operation failed",
} as SuccessVariant | ErrorVariant;

describe("Variant", () => {
  test("is() should return true for a matching tag", () => {
    expect(Variant.is(successVariant, "success")).toBe(true);
    expect(Variant.is(errorVariant, "error")).toBe(true);
  });

  test("is() should return false for a non-matching tag", () => {
    expect(Variant.is(successVariant, "error")).toBe(false);
    expect(Variant.is(errorVariant, "success")).toBe(false);
  });
});
