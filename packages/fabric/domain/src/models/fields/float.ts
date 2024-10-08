import { TaggedVariant, VariantTag } from "@fabric/core";
import { BaseField } from "./base-field.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FloatFieldOptions extends BaseField {}

export interface FloatField
  extends TaggedVariant<"FloatField">,
    FloatFieldOptions {}

export function createFloatField<T extends FloatFieldOptions>(
  opts: T = {} as T,
): FloatField & T {
  return {
    [VariantTag]: "FloatField",
    ...opts,
  } as const;
}
