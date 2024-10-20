import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface BooleanFieldOptions extends BaseField {}

export interface BooleanField
  extends TaggedVariant<"BooleanField">, BooleanFieldOptions {}

export function createBooleanField<T extends BooleanFieldOptions>(
  opts: T = {} as T,
): BooleanField & T {
  return {
    [VariantTag]: "BooleanField",
    ...opts,
  } as const;
}
