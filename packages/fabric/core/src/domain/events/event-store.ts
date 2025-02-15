/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Effect } from "../../effect/effect.js";
import type { TaggedError } from "../../error/tagged-error.js";
import { UnexpectedError } from "../../error/unexpected-error.js";
import type { PosixDate } from "../../time/posix-date.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import { VariantTag } from "../../variant/variant.js";
import { Field, Model } from "../models/index.js";
import type { StoreQueryError } from "../value-store/index.js";
import type { ValueStoreDriver } from "../value-store/value-store-driver.js";
import type {
  ReadonlyValueStore,
  WritableValueStore,
} from "../value-store/value-store.js";
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
  const TAggregateModels extends AggregateModel,
  const TEventStreams extends EventStream<TAggregateModels>,
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
      .flatMap(() =>
        this.storageDriver.sync(this.models as unknown as Model[]),
      );
  }

  get stateStore(): ReadonlyValueStore<AggregateModel> {
    return this.valueStore;
  }

  /**
   * Store a new event in the event store.
   */
  append<
    TStreamName extends TEventStreams["name"],
    TEvent extends PossibleEvents<
      EventStreamFromName<TEventStreams, TStreamName>
    >,
  >(streamName: TStreamName, event: TEvent): Effect<TEvent, UnexpectedError> {
    return this.storageDriver
      .insert(
        this.models.find((m) => m.name === streamName)! as unknown as Model,
        {
          into: streamName,
          values: [event],
        },
      )
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
