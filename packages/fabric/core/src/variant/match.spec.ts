import { describe, expect, it } from "vitest";
import { match } from "./match.js";
import { TaggedVariant, VariantTag } from "./variant.js";

interface V1 extends TaggedVariant<"V1"> {
  a: number;
}
interface V2 extends TaggedVariant<"V2"> {
  b: string;
}

type Variant = V1 | V2;

describe("Pattern matching", () => {
  it("Should match a pattern", () => {
    const v = { [VariantTag]: "V1", a: 42 } as Variant;

    const result = match(v).case({
      V1: (v) => v.a,
      V2: (v) => v.b,
    });

    expect(result).toBe(42);
  });

  it("Should alert that a pattern is not exhaustive", () => {
    const v = { [VariantTag]: "V1", a: 42 } as Variant;

    expect(() =>
      // @ts-expect-error Testing non-exhaustive pattern matching
      match(v).case({
        V2: (v) => v.b,
      }),
    ).toThrowError("Non-exhaustive pattern match");
  });
});
