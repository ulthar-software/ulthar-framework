/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModelToType } from "../models/model.js";
import type { AggregateModel } from "./aggregate.js";
import type { DomainEvent } from "./event.js";

export interface EventStreamHandlers<
  TModel extends AggregateModel,
  TEventTags extends EventNames,
> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  create<TEvent extends DomainEvent<TEventTags["createEvents"][number]>>(
    event: TEvent,
  ): ModelToType<TModel>;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  update<TEvent extends DomainEvent<TEventTags["updateEvents"][number]>>(
    event: TEvent,
    model: ModelToType<TModel>,
  ): ModelToType<TModel>;
}

export interface EventNames<
  TCreateTag extends string = string,
  TUpdateTag extends string = string,
  TDeleteTag extends string = string,
> {
  createEvents: TCreateTag[];
  updateEvents: TUpdateTag[];
  deleteEvents: TDeleteTag[];
}

export class EventStream<
  const TModel extends AggregateModel = AggregateModel,
  const TEventNames extends EventNames = EventNames,
> {
  constructor(
    readonly model: TModel,
    readonly events: TEventNames,
    readonly handlers: EventStreamHandlers<TModel, TEventNames>,
  ) {}

  get name(): TModel["name"] {
    return this.model.name;
  }
}

export type PossibleEvents<T extends EventStream<any, any>> =
  T extends EventStream<any, infer TEventTags>
    ? DomainEvent<
        | TEventTags["createEvents"][number]
        | TEventTags["updateEvents"][number]
        | TEventTags["deleteEvents"][number]
      >
    : never;

export type EventStreamFromName<
  T extends EventStream<any, any>,
  TName extends T["name"],
> = Extract<T, { name: TName }>;
