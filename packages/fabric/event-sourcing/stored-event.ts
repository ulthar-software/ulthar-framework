import type { PosixDate } from "@fabric/core";
import { Field, Model } from "@fabric/models";
import type { DomainEvent } from "./event.ts";

/**
 * A stored event is an inmutable event, already stored, with it's version in the stream and timestamp.
 */
export type StoredEvent<TEvent extends DomainEvent> = TEvent & {
  readonly version: bigint;
  readonly timestamp: PosixDate;
};

export const StoredEventModel = new Model("events", {
  id: Field.uuid({ isPrimaryKey: true }),
  streamId: Field.uuid({}),
  version: Field.integer({ hasArbitraryPrecision: true }),
  // deno-lint-ignore no-explicit-any
  payload: Field.embedded<any>({}),
  timestamp: Field.posixDate({}),
});
