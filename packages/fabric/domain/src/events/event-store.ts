import { AsyncResult, PosixDate } from "@fabric/core";
import { StoreQueryError } from "../errors/query-error.js";
import { EventsFromStream, EventStream } from "./event-stream.js";
import { StoredEvent } from "./stored-event.js";

export interface EventStore<TEventStream extends EventStream> {
  /**
   * Store a new event in the event store.
   */
  append<
    TStreamKey extends TEventStream["name"],
    T extends EventsFromStream<TEventStream, TStreamKey>,
  >(
    streamName: TStreamKey,
    event: T,
  ): AsyncResult<StoredEvent<T>, StoreQueryError>;
}

export interface EventFilterOptions {
  fromDate?: PosixDate;
  toDate?: PosixDate;
  fromVersion?: bigint;
  toVersion?: bigint;
  limit?: number;
  offset?: number;
}
