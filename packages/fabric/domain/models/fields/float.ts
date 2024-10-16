import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface FloatFieldOptions extends BaseField {}

export interface FloatField
  extends TaggedVariant<"FloatField">, FloatFieldOptions {}

export function createFloatField<T extends FloatFieldOptions>(
  opts: T = {} as T,
): FloatField & T {
  return {
    [VariantTag]: "FloatField",
    ...opts,
  } as const;
}
