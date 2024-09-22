/* eslint-disable @typescript-eslint/no-explicit-any */
import { PosixDate } from "../../time/posix-date.js";
import { TaggedVariant } from "../../variant/variant.js";
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
export interface StoredEvent<TTag extends string = string, TPayload = any>
  extends Readonly<Event<TTag, TPayload>> {
  readonly version: number;
  readonly timestamp: PosixDate;
}
