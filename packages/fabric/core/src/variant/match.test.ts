import { expect } from "jsr:@std/expect";
import { match } from "./match.ts";
import { type TaggedVariant, VariantTag } from "./variant.ts";

interface V1 extends TaggedVariant<"V1"> {
  a: number;
}
interface V2 extends TaggedVariant<"V2"> {
  b: string;
}

type Variant = V1 | V2;

const v = { [VariantTag]: "V1", a: 42 } as Variant;

Deno.test("match().case() calls the correct function", () => {
  const result = match(v).case({
    V1: (v) => v.a,
    V2: (v) => v.b,
  });

  expect(result).toBe(42);
});

Deno.test(
  "match().case() throws an error for non-exhaustive pattern matching",
  () => {
    expect(() =>
      // @ts-expect-error Testing non-exhaustive pattern matching
      match(v).case({
        V2: (v) => v.b,
      })
    ).toThrow("Non-exhaustive pattern match");
  }
);
