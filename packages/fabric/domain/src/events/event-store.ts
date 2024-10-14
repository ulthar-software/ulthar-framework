import { AsyncResult, MaybePromise, PosixDate } from "@fabric/core";
import { StoreQueryError } from "../errors/query-error.js";
import { UUID } from "../types/uuid.js";
import { Event, EventFromKey } from "./event.js";
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

  subscribe<TEventKey extends TEvents["type"]>(
    events: TEventKey[],
    subscriber: EventSubscriber<EventFromKey<TEvents, TEventKey>>,
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
