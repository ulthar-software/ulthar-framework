import { describe, expect, test } from "@fabric/testing";
import { variantConstructor } from "./constructor.ts";
import type { TaggedVariant } from "./variant.ts";

interface TestVariant extends TaggedVariant<string> {
  _tag: "test";
  value: number;
}
interface TestVariantWithOptionals extends TaggedVariant<string> {
  _tag: "test2";
  value?: number;
}

describe("variantConstructor", () => {
  test("given a tag, it should create a variant with the specified tag", () => {
    const createTestVariant = variantConstructor<TestVariant>("test");
    const variant = createTestVariant({ value: 42 });

    // The following line should fail because the required properties are not provided.
    // expect(() => createTestVariant()).toThrow();

    expect(variant._tag).toBe("test");
    expect(variant.value).toBe(42);
  });

  test(
    "given only optional properties, it should require an empty object",
    () => {
      // deno-lint-ignore no-unused-vars
      const createTestVariant = variantConstructor<TestVariantWithOptionals>(
        "test2",
      );

      // The following line should fail because the required properties are not provided.
      // expect(() => createTestVariant()).toThrow();
    },
  );

  test("given different options, it should allow creating multiple variants", () => {
    const createTestVariant = variantConstructor<TestVariant>("test");
    const variant1 = createTestVariant({ value: 1 });
    const variant2 = createTestVariant({ value: 2 });

    expect(variant1._tag).toBe("test");
    expect(variant1.value).toBe(1);
    expect(variant2._tag).toBe("test");
    expect(variant2.value).toBe(2);
  });

  test("given additional properties, it should create a variant with those properties", () => {
    interface ExtendedTestVariant extends TestVariant {
      extra: string;
    }

    const createExtendedTestVariant = variantConstructor<ExtendedTestVariant>(
      "test",
    );
    const variant = createExtendedTestVariant({ value: 42, extra: "extra" });

    expect(variant._tag).toBe("test");
    expect(variant.value).toBe(42);
    expect(variant.extra).toBe("extra");
  });
});
