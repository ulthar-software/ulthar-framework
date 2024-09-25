/* eslint-disable @typescript-eslint/no-explicit-any */
import { PosixDate, TaggedVariant } from "@fabric/core";
import { UUID } from "../types/uuid.js";

/**
 * An event is a tagged variant with a payload and a timestamp.
 */
export interface Event<TTag extends string = string, TPayload = any>
  extends TaggedVariant<TTag> {
  streamId: UUID;
  payload: TPayload;
}

/**
 * A stored event is an inmutable event, already stored, with it's version in the stream and timestamp.
 */
export type StoredEvent<TEvent extends Event> = Readonly<TEvent> & {
  readonly version: number;
  readonly timestamp: PosixDate;
};
