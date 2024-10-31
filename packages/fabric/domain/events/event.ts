// deno-lint-ignore-file no-explicit-any
import type { TaggedVariant, VariantTag } from "@fabric/core";
import type { UUID } from "../../core/types/uuid.ts";

/**
 * An event is a tagged variant with a payload and a timestamp.
 */
export interface DomainEvent<TTag extends string = string, TPayload = any>
  extends TaggedVariant<TTag> {
  readonly id: UUID;
  readonly streamId: UUID;
  readonly payload: TPayload;
}

export type EventFromKey<
  TEvents extends DomainEvent,
  TKey extends TEvents[VariantTag],
> = Extract<TEvents, { [VariantTag]: TKey }>;
