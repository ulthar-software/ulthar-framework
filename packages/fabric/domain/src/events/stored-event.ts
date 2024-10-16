import type { PosixDate } from "@fabric/core";
import type { Event } from "./event.ts";

/**
 * A stored event is an inmutable event, already stored, with it's version in the stream and timestamp.
 */
export type StoredEvent<TEvent extends Event> = TEvent & {
  readonly version: bigint;
  readonly timestamp: PosixDate;
};
