import { Effect } from "../../effect/effect.js";
import type { TaggedError } from "../../error/tagged-error.js";
import { UnexpectedError } from "../../error/unexpected-error.js";
import type { PosixDate } from "../../time/posix-date.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import type { StoreQueryError } from "../value-store/index.js";
import type { ValueStoreDriver } from "../value-store/value-store-driver.js";
import type {
  EventStream,
  EventStreamFromName,
  PossibleEvents,
} from "./event-stream.js";
import type { EventToType } from "./event.js";
import { DomainEvent } from "./event.js";

export class EventStore<TEventStreams extends readonly EventStream[]> {
  private eventSubscriptions: EventSubscriptions = {};
  private streamModels: Record<string, DomainEvent> = {};

  constructor(
    private readonly storageDriver: ValueStoreDriver,
    private readonly eventStreams: TEventStreams,
  ) {
    for (const stream of eventStreams) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.streamModels[stream.name] !== undefined) {
        throw new UnexpectedError(
          `Stream with name ${stream.name} is declared multiple times`,
        );
      }

      this.streamModels[stream.name] = new DomainEvent(stream.name, {});
    }
  }

  sync(): Effect<void, CircularDependencyError | StoreQueryError> {
    return this.storageDriver.sync(Object.values(this.streamModels));
  }

  /**
   * Store a new event in the event store.
   */
  append<
    const TStreamName extends TEventStreams[number]["name"],
    const TEvent extends PossibleEvents<
      EventStreamFromName<TEventStreams[number], TStreamName>
    >,
  >(
    streamName: TStreamName,
    event: EventToType<TEvent>,
  ): Effect<EventToType<TEvent>, UnexpectedError> {
    return this.storageDriver
      .insert(this.streamModels[streamName], {
        into: streamName,
        values: [event],
      })
      .flatMap(() =>
        Effect.all(() =>
          this.eventSubscriptions[streamName][event.type].map((subscription) =>
            subscription.subscriber(event),
          ),
        ),
      )
      .mapError((error) => new UnexpectedError(error.message))
      .map(() => event);
  }

  subscribe<
    TStreamName extends TEventStreams[number]["name"],
    TEventName extends PossibleEvents<
      EventStreamFromName<TEventStreams[number], TStreamName>
    >["name"],
  >(
    streamName: TStreamName,
    eventName: TEventName,
    subscriber: EventSubscriber<TEventName>,
    opts?: SubscriptionOptions,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.eventSubscriptions[streamName] === undefined) {
      this.eventSubscriptions[streamName] = {};
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.eventSubscriptions[streamName][eventName] === undefined) {
      this.eventSubscriptions[streamName][eventName] = [];
    }

    this.eventSubscriptions[streamName][eventName].push({
      opts: opts ?? {},
      subscriber: subscriber as EventSubscriber<string>,
    });
  }
}

export type EventSubscriptions = Record<string, SubscriptionMap>;
export type SubscriptionMap = Record<string, Subscription[]>;
export interface Subscription {
  opts: SubscriptionOptions;
  subscriber: EventSubscriber<string>;
}

export type EventSubscriber<TEventName extends string> = (
  event: EventToType<DomainEvent<TEventName>>,
) => Effect<void, TaggedError>;

export interface SubscriptionOptions {
  callOnReplay?: boolean; //defaults to false
}

export interface EventFilterOptions {
  fromDate?: PosixDate;
  toDate?: PosixDate;
  fromVersion?: bigint;
  toVersion?: bigint;
  limit?: number;
  offset?: number;
}
