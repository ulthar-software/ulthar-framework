/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PosixDate, TaggedVariant, UUID, VariantTag } from "@fabric/core";

/**
 * An event is a tagged variant with a payload, an id, a streamId, a version and a timestamp.
 */
export interface DomainEvent<TTag extends string = string, TPayload = any>
  extends TaggedVariant<TTag> {
  readonly id: UUID;
  readonly streamId: UUID;
  readonly version: bigint;
  readonly payload: TPayload;
  readonly timestamp: PosixDate;
}

export type EventFromKey<
  TEvents extends DomainEvent,
  TKey extends TEvents[VariantTag],
> = Extract<TEvents, { [VariantTag]: TKey }>;
