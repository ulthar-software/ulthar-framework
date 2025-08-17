import { Effect } from "../../effect/effect.js";
import type { TaggedError } from "../../error/tagged-error.js";
import { UnexpectedError } from "../../error/unexpected-error.js";
import type { PosixDate } from "../../time/posix-date.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import { Field } from "../models/fields.js";
import { Model } from "../models/model.js";
import type { Infer } from "../models/schema.js";
import type { StoreQueryError } from "../value-store/index.js";
import type { ValueStoreDriver } from "../value-store/value-store-driver.js";
import type {
  EventStream,
  EventStreamFromName,
  PossibleEvents,
} from "./event-stream.js";
import type { DomainEvent, EventToType } from "./event.js";

const EventModel = new Model("events", {
  id: Field.uuid({ isPrimaryKey: true }),
  streamName: Field.string(),
  type: Field.string(),
  streamId: Field.uuid(),
  version: Field.integer({ isUnsigned: true }),
  timestamp: Field.posixDate(),
  payload: Field.embedded({}),
});

type EventType = Infer<typeof EventModel>;

export class EventStore<TEventStreams extends readonly EventStream[]> {
  private eventSubscriptions: SubscriptionMap = {};

  constructor(
    private readonly storageDriver: ValueStoreDriver,
    private readonly eventStreams: TEventStreams,
  ) {}

  close(): Effect<void, StoreQueryError> {
    return this.storageDriver.close();
  }

  sync(): Effect<void, CircularDependencyError | StoreQueryError> {
    return this.storageDriver.sync([EventModel]);
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
      .insert(EventModel, {
        into: "events",
        values: [{ ...event, streamName }],
      })
      .flatMap(() => {
        const subscriptionKey = `${streamName}:${event.type}`;
        const subs = this.eventSubscriptions[subscriptionKey];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!subs) {
          return Effect.ok();
        }
        return Effect.allInSequence(() =>
          subs.map((subscription) => subscription.subscriber(event)),
        ).discardValue();
      })
      .tapError((error) => {
        console.error(error);
      })
      .mapError((error) => new UnexpectedError(error.message))
      .map(() => event);
  }

  subscribe<
    const TEventName extends TEventStreams[number]["events"][number]["name"],
    const TEvent extends Extract<
      PossibleEvents<TEventStreams[number]>,
      { name: TEventName }
    >,
  >(
    streamName: TEventStreams[number]["name"],
    eventName: TEventName,
    subscriber: EventSubscriber<TEvent>,
    opts?: SubscriptionOptions,
  ): void {
    const subscriptionKey = `${streamName}:${eventName}`;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.eventSubscriptions[subscriptionKey] === undefined) {
      this.eventSubscriptions[subscriptionKey] = [];
    }

    this.eventSubscriptions[subscriptionKey].push({
      opts: opts ?? {},
      subscriber: subscriber as EventSubscriber<DomainEvent>,
    });
  }

  replayAll(): Effect<void, StoreQueryError | TaggedError> {
    return this.storageDriver
      .get(EventModel, {
        from: "events",
        orderBy: {
          timestamp: "ASC",
        },
      })
      .flatMap((events) => {
        return Effect.allInSequence(() =>
          events.map((event) => this.replayEvent(event as EventType)),
        ).discardValue();
      });
  }

  private replayEvent(event: EventType): Effect<void, TaggedError> {
    const eventName = event.type;
    const streamName = event.streamName;

    // Use the stored streamName to find the exact subscription
    const subscriptionKey = `${streamName}:${eventName}`;
    const subscriptions = this.eventSubscriptions[subscriptionKey];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (subscriptions) {
      return Effect.allInSequence(() =>
        subscriptions.map((subscription) => {
          if (subscription.opts.callOnReplay) {
            return subscription.subscriber(event).catchAll((e) => {
              console.error(e);
            });
          }
          return Effect.ok();
        }),
      ).discardValue();
    }
    return Effect.ok();
  }
}

export type SubscriptionMap = Record<string, Subscription[]>;
export interface Subscription {
  opts: SubscriptionOptions;
  subscriber: EventSubscriber<DomainEvent>;
}

export type EventSubscriber<TEvent extends DomainEvent> = (
  event: EventToType<TEvent>,
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
