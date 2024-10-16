import type { VariantTag } from "@fabric/core";
import type { Event } from "../events/event.ts";
import type { StoredEvent } from "../events/stored-event.ts";
import type { Model, ModelToType } from "../models/model.ts";

export interface Projection<TModel extends Model, TEvents extends Event> {
  model: TModel;
  events: TEvents[VariantTag][];
  projection: (
    event: StoredEvent<TEvents>,
    model?: ModelToType<TModel>
  ) => ModelToType<TModel>;
}
