import type { VariantTag } from "@fabric/core";
import type { DomainEvent } from "../events/event.ts";
import type { StoredEvent } from "../events/stored-event.ts";
import type { AggregateModel, ModelToType } from "../models/model.ts";

export interface Projection<
  TModel extends AggregateModel,
  TEvents extends DomainEvent,
> {
  model: TModel;
  events: TEvents[VariantTag][];
  projection: (
    event: StoredEvent<TEvents>,
    model?: ModelToType<TModel>,
  ) => ModelToType<TModel>;
}
