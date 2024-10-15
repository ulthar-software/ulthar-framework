import {
  AsyncResult,
  MaybePromise,
  PosixDate,
  VariantFromTag,
  VariantTag,
} from "@fabric/core";
import { StoreQueryError } from "../errors/query-error.js";
import { UUID } from "../types/uuid.js";
import { Event } from "./event.js";
import { StoredEvent } from "./stored-event.js";

export interface EventStore<TEvents extends Event> {
  /**
   * Store a new event in the event store.
   */
  append<T extends TEvents>(
    event: T,
  ): AsyncResult<StoredEvent<T>, StoreQueryError>;

  getEventsFromStream(
    streamId: UUID,
  ): AsyncResult<StoredEvent<TEvents>[], StoreQueryError>;

  subscribe<TEventKey extends TEvents[VariantTag]>(
    events: TEventKey[],
    subscriber: EventSubscriber<VariantFromTag<TEvents, TEventKey>>,
  ): void;
}

export type EventSubscriber<TEvents extends Event = Event> = (
  event: StoredEvent<TEvents>,
) => MaybePromise<void>;

export interface EventFilterOptions {
  fromDate?: PosixDate;
  toDate?: PosixDate;
  fromVersion?: bigint;
  toVersion?: bigint;
  limit?: number;
  offset?: number;
}
