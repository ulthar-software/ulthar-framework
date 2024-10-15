/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedVariant, VariantTag } from "@fabric/core";
import { BaseField } from "./base-field.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
export interface EmbeddedFieldOptions<T = any> extends BaseField {}

export interface EmbeddedField<T = any>
  extends TaggedVariant<"EmbeddedField">,
    EmbeddedFieldOptions<T> {}

export function createEmbeddedField<
  K = any,
  T extends EmbeddedFieldOptions<K> = EmbeddedFieldOptions<K>,
>(opts: T = {} as T): EmbeddedField & T {
  return {
    [VariantTag]: "EmbeddedField",
    ...opts,
  } as const;
}
