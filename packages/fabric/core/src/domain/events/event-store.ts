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
  private eventSubscriptions: SubscriptionMap = {};

  private eventModel = new DomainEvent("events", {});

  constructor(
    private readonly storageDriver: ValueStoreDriver,
    private readonly eventStreams: TEventStreams,
  ) {}

  close(): Effect<void, StoreQueryError> {
    return this.storageDriver.close();
  }

  sync(): Effect<void, CircularDependencyError | StoreQueryError> {
    return this.storageDriver.sync([this.eventModel]);
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
      .insert(this.eventModel, {
        into: "events",
        values: [event],
      })
      .flatMap(() => {
        const subs = this.eventSubscriptions[event.type];
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
    eventName: TEventName,
    subscriber: EventSubscriber<TEvent>,
    opts?: SubscriptionOptions,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.eventSubscriptions[eventName] === undefined) {
      this.eventSubscriptions[eventName] = [];
    }

    this.eventSubscriptions[eventName].push({
      opts: opts ?? {},
      subscriber: subscriber as EventSubscriber<DomainEvent>,
    });
  }

  replayAll(): Effect<void, StoreQueryError | TaggedError> {
    return this.storageDriver
      .get<EventToType<DomainEvent>>(this.eventModel, {
        from: "events",
        orderBy: {
          timestamp: "ASC",
        },
      })
      .flatMap((events) => {
        return Effect.allInSequence(() =>
          events.map((event) => this.replayEvent(event)),
        ).discardValue();
      });
  }

  private replayEvent(
    event: EventToType<DomainEvent>,
  ): Effect<void, TaggedError> {
    const eventName = event.type;
    const subscriptions = this.eventSubscriptions[eventName];
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
