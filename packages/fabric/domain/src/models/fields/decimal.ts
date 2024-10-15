import { TaggedVariant, VariantTag } from "@fabric/core";
import { BaseField } from "./base-field.js";

export interface DecimalFieldOptions extends BaseField {
  isUnsigned?: boolean;
  precision?: number;
  scale?: number;
}

export interface DecimalField
  extends TaggedVariant<"DecimalField">,
    DecimalFieldOptions {}

export function createDecimalField<T extends DecimalFieldOptions>(
  opts: T = {} as T,
): DecimalField & T {
  return {
    [VariantTag]: "DecimalField",
    ...opts,
  } as const;
}
