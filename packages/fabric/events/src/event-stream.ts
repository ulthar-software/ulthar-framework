import type { ModelFields, ModelToType } from "@fabric/models";
import type { AggregateModel } from "./aggregate.js";
import type { DomainEvent } from "./event.js";
import type { StoredEvent } from "./stored-event.js";

export interface EventStreamHandlers<
  TModel extends AggregateModel<string, ModelFields>,
  TEventTags extends EventTags,
> {
  create: (
    event: StoredEvent<DomainEvent<TEventTags["create"][number]>>,
  ) => ModelToType<TModel>;
  update: (
    event: StoredEvent<DomainEvent<TEventTags["update"][number]>>,
    model: ModelToType<TModel>,
  ) => ModelToType<TModel>;
}

export interface EventTags<
  TCreateTag extends string = string,
  TUpdateTag extends string = string,
  TDeleteTag extends string = string,
> {
  create: TCreateTag[];
  update: TUpdateTag[];
  delete: TDeleteTag[];
}

export class EventStream<
  const TModel extends AggregateModel<string, ModelFields>,
  const TEventTags extends EventTags,
> {
  constructor(
    readonly model: TModel,
    readonly tags: TEventTags,
    readonly handlers: EventStreamHandlers<TModel, TEventTags>,
  ) {}

  get name(): string {
    return this.model.name;
  }
}
