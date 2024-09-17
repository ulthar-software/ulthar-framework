import { TaggedVariant, VariantTag } from "../../../variant/variant.js";
import { BaseField } from "./base-field.js";

export interface UUIDOptions extends BaseField {
  isPrimaryKey?: boolean;
}

export interface UUIDField extends TaggedVariant<"UUIDField">, UUIDOptions {}

export function createUUIDField(opts: UUIDOptions): UUIDField {
  return {
    [VariantTag]: "UUIDField",
    ...opts,
  };
}
