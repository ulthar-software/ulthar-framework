import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface StringFieldOptions extends BaseField {
  maxLength?: number;
  minLength?: number;
}

export interface StringField
  extends TaggedVariant<"StringField">, StringFieldOptions {}

export function createStringField<T extends StringFieldOptions>(
  opts: T = {} as T,
): StringField & T {
  return {
    [VariantTag]: "StringField",
    ...opts,
  } as const;
}
