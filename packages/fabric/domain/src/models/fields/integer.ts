import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface IntegerFieldOptions extends BaseField {
  isUnsigned?: boolean;
  hasArbitraryPrecision?: boolean;
}

export interface IntegerField
  extends TaggedVariant<"IntegerField">, IntegerFieldOptions {}

export function createIntegerField<T extends IntegerFieldOptions>(
  opts: T = {} as T,
): IntegerField & T {
  return {
    [VariantTag]: "IntegerField",
    ...opts,
  } as const;
}
