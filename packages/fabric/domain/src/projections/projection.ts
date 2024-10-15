import { VariantTag } from "@fabric/core";
import { Event } from "../events/event.js";
import { StoredEvent } from "../events/stored-event.js";
import { Model, ModelToType } from "../models/model.js";

export interface Projection<TModel extends Model, TEvents extends Event> {
  model: TModel;
  events: TEvents[VariantTag][];
  projection: (
    event: StoredEvent<TEvents>,
    model?: ModelToType<TModel>,
  ) => ModelToType<TModel>;
}
