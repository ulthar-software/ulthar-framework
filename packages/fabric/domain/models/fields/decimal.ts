import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface DecimalFieldOptions extends BaseField {
  isUnsigned?: boolean;
  precision?: number;
  scale?: number;
}

export interface DecimalField
  extends TaggedVariant<"DecimalField">, DecimalFieldOptions {}

export function createDecimalField<T extends DecimalFieldOptions>(
  opts: T = {} as T,
): DecimalField & T {
  return {
    [VariantTag]: "DecimalField",
    ...opts,
  } as const;
}
