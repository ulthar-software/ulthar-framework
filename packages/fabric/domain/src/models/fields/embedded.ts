// deno-lint-ignore-file no-explicit-any
import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface EmbeddedFieldOptions<T = any> extends BaseField {}

export interface EmbeddedField<T = any>
  extends TaggedVariant<"EmbeddedField">,
    EmbeddedFieldOptions<T> {}

export function createEmbeddedField<
  K = any,
  T extends EmbeddedFieldOptions<K> = EmbeddedFieldOptions<K>
>(opts: T = {} as T): EmbeddedField & T {
  return {
    [VariantTag]: "EmbeddedField",
    ...opts,
  } as const;
}
