import { type TaggedVariant, VariantTag } from "@fabric/core";
import type { BaseField } from "./base-field.ts";

export interface TimestampFieldOptions extends BaseField {}

export interface TimestampField
  extends TaggedVariant<"TimestampField">, TimestampFieldOptions {}

export function createTimestampField<T extends TimestampFieldOptions>(
  opts: T = {} as T,
): TimestampField & T {
  return {
    [VariantTag]: "TimestampField",
    ...opts,
  } as const;
}
