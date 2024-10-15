/* eslint-disable @typescript-eslint/no-explicit-any */
import { VariantTag } from "@fabric/core";
import { UUID } from "../types/uuid.js";

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
