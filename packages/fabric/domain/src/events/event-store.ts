import { AsyncResult, MaybePromise, PosixDate } from "@fabric/core";
import { StoreQueryError } from "../errors/query-error.js";
import { UUID } from "../types/uuid.js";
import { Event, StoredEvent } from "./event.js";

export interface EventStore<TEvent extends Event = Event> {
  getStream<TEventStreamEvent extends TEvent>(
    streamId: UUID,
  ): AsyncResult<EventStream<TEventStreamEvent>, StoreQueryError>;

  appendToStream<TEvent extends Event>(
    streamId: UUID,
    events: TEvent,
  ): AsyncResult<void, StoreQueryError>;
}

export interface EventStream<TEvent extends Event = Event> {
  getCurrentVersion(): bigint;

  append(events: TEvent): AsyncResult<StoredEvent<TEvent>, StoreQueryError>;

  subscribe(callback: (event: StoredEvent<TEvent>) => MaybePromise<void>): void;

  getEvents(
    opts?: EventFilterOptions,
  ): AsyncResult<StoredEvent<TEvent>[], StoreQueryError>;
}

export interface EventFilterOptions {
  fromDate?: PosixDate;
  toDate?: PosixDate;
  fromVersion?: number;
  toVersion?: number;
  limit?: number;
  offset?: number;
}
