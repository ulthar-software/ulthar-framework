import { TaggedVariant, VariantTag } from "../../../variant/variant.js";
import { BaseField } from "./base-field.js";

export interface UUIDFieldOptions extends BaseField {
  isPrimaryKey?: boolean;
}

export interface UUIDField
  extends TaggedVariant<"UUIDField">,
    UUIDFieldOptions {}

export function createUUIDField<T extends UUIDFieldOptions>(
  opts: T = {} as T,
): UUIDField & T {
  return {
    [VariantTag]: "UUIDField",
    ...opts,
  } as const;
}
