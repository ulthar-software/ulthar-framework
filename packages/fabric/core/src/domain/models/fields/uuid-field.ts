import { TaggedVariant, VariantTag } from "../../../variant/variant.js";
import { BaseField } from "./base-field.js";

export interface UUIDOptions extends BaseField {
  isPrimaryKey?: boolean;
}

export interface UUIDField extends TaggedVariant<"UUID_FIELD">, UUIDOptions {}

export function createUUIDField(opts: UUIDOptions): UUIDField {
  return {
    [VariantTag]: "UUID_FIELD",
    ...opts,
  };
}
