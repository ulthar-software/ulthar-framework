import type {
  Effect,
  MaybePromise,
  PosixDate,
  UnexpectedError,
  UUID,
  VariantFromTag,
  VariantTag,
} from "@fabric/core";
import type { StoreQueryError } from "../errors/query-error.ts";
import type { DomainEvent } from "./event.ts";
import type { StoredEvent } from "./stored-event.ts";

export interface EventStore<TEvents extends DomainEvent> {
  /**
   * Store a new event in the event store.
   */
  append<T extends TEvents>(
    event: T,
  ): Effect<StoredEvent<T>, StoreQueryError | UnexpectedError>;

  getEventsFromStream(
    streamId: UUID,
  ): Effect<StoredEvent<TEvents>[], StoreQueryError>;

  subscribe<TEventKey extends TEvents[VariantTag]>(
    events: TEventKey[],
    subscriber: EventSubscriber<VariantFromTag<TEvents, TEventKey>>,
  ): void;
}

export type EventSubscriber<TEvents extends DomainEvent = DomainEvent> = (
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
