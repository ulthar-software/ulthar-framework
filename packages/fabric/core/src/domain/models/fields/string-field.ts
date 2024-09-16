import { TaggedVariant, VariantTag } from "../../../variant/variant.js";
import { BaseField } from "./base-field.js";

export interface StringFieldOptions extends BaseField {
  maxLength?: number;
  minLength?: number;
}

export interface StringField
  extends TaggedVariant<"StringField">,
    StringFieldOptions {}

export function createStringField<T extends StringFieldOptions>(
  opts: T,
): StringField & T {
  return {
    [VariantTag]: "StringField",
    ...opts,
  } as const;
}
