/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Effect,
  UnexpectedError,
  VariantTag,
  type PosixDate,
  type TaggedError,
} from "@fabric/core";
import type {
  CircularDependencyError,
  ReadonlyValueStore,
  StoreQueryError,
  ValueStoreDriver,
  WritableValueStore,
} from "@fabric/db";
import { Field, Model } from "@fabric/models";
import type { AggregateModel } from "./aggregate.js";
import type {
  EventStream,
  EventStreamFromName,
  PossibleEvents,
} from "./event-stream.js";
import type { DomainEvent } from "./event.js";

export const DefaultStreamModelFields = {
  _tag: Field.string(),
  streamId: Field.uuid(),
  id: Field.uuid({ isPrimaryKey: true }),
  version: Field.integer({ hasArbitraryPrecision: true }),
  payload: Field.embedded(),
  timestamp: Field.posixDate(),
} as const;
export type DefaultStreamModelFields = typeof DefaultStreamModelFields;

export class EventStore<
  TAggregateModels extends AggregateModel,
  TEventStreams extends EventStream<TAggregateModels>,
> {
  private models: Model<string, DefaultStreamModelFields>[];
  private eventSubscriptions: EventSubscriptions = {};

  constructor(
    private storageDriver: ValueStoreDriver,
    private valueStore: WritableValueStore<TEventStreams["model"]>,
    private eventStreams: TEventStreams[],
  ) {
    this.models = eventStreams.map(
      (stream) =>
        new Model(stream.name, DefaultStreamModelFields, {
          constraints: [{ type: "unique", fields: ["streamId", "version"] }],
        }),
    );

    eventStreams.forEach((stream) => {
      stream.events.createEvents.forEach((tag: string) => {
        this.subscribe(
          stream.name,
          tag,
          (event) =>
            this.valueStore
              .insertInto(stream.name)
              .value(stream.handlers.create(event)),
          {
            callOnReplay: true,
          },
        );
      });
      stream.events.updateEvents.forEach((tag: string) => {
        this.subscribe(
          stream.name,
          tag,
          (event) =>
            this.valueStore
              .from(stream.name)
              .where({ id: event.streamId } as any)
              .selectOneOrFail()
              .flatMap((model) =>
                this.valueStore
                  .update(stream.name)
                  .oneById(event.streamId)
                  .set(stream.handlers.update(event, model)),
              ),
          {
            callOnReplay: true,
          },
        );
      });
      stream.events.deleteEvents.forEach((tag: string) => {
        this.subscribe(
          stream.name,
          tag,
          (event) =>
            this.valueStore.deleteFrom(stream.name).oneById(event.streamId),
          {
            callOnReplay: true,
          },
        );
      });
    });
  }

  sync(): Effect<void, CircularDependencyError | StoreQueryError> {
    return this.valueStore
      .sync()
      .flatMap(() => this.storageDriver.sync(this.models));
  }

  get stateStore(): ReadonlyValueStore<AggregateModel> {
    return this.valueStore;
  }

  /**
   * Store a new event in the event store.
   */
  append<T extends PossibleEvents<TEventStreams>>(
    streamName: TEventStreams["name"],
    event: T,
  ): Effect<T, UnexpectedError> {
    return this.storageDriver
      .insert(this.models.find((m) => m.name === streamName)!, {
        into: streamName,
        values: [event],
      })
      .errorMap((error: Error) => new UnexpectedError(error.message))
      .flatMap(() =>
        Effect.allSkippingErrors(() =>
          this.eventSubscriptions[streamName][event[VariantTag]].map(
            (subscription) => subscription.subscriber(event),
          ),
        ),
      )
      .map(() => event);
  }

  subscribe<
    TStreamName extends TEventStreams["name"],
    TEventName extends PossibleEvents<
      EventStreamFromName<TEventStreams, TStreamName>
    >[VariantTag],
  >(
    streamName: TStreamName,
    event: TEventName,
    subscriber: EventSubscriber<TEventName>,
    opts?: SubscriptionOptions,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.eventSubscriptions[streamName] === undefined) {
      this.eventSubscriptions[streamName] = {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.eventSubscriptions[streamName][event] === undefined) {
      this.eventSubscriptions[streamName][event] = [];
    }

    this.eventSubscriptions[streamName][event].push({
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
  event: DomainEvent<TEventName>,
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
