import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface UUIDFieldOptions extends BaseField {
  isPrimaryKey?: boolean;
}

export interface UUIDField
  extends TaggedVariant<"UUIDField">, UUIDFieldOptions {}

export function createUUIDField<T extends UUIDFieldOptions>(
  opts: T = {} as T,
): UUIDField & T {
  return {
    [VariantTag]: "UUIDField",
    ...opts,
  } as const;
}
