// deno-lint-ignore-file no-explicit-any
import type { VariantTag } from "@fabric/core";
import type { UUID } from "../types/uuid.ts";

/**
 * An event is a tagged variant with a payload and a timestamp.
 */
export interface Event<TTag extends string = string, TPayload = any> {
  readonly [VariantTag]: TTag;
  readonly id: UUID;
  readonly streamId: UUID;
  readonly payload: TPayload;
}

export type EventFromKey<
  TEvents extends Event,
  TKey extends TEvents[VariantTag],
> = Extract<TEvents, { [VariantTag]: TKey }>;
