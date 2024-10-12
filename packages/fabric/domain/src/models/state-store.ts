import { AsyncResult } from "@fabric/core";
import { StoreQueryError } from "../errors/query-error.js";
import { ModelSchemaFromModels } from "./model-schema.js";
import { Model, ModelToType } from "./model.js";
import { StoreQuery } from "./query/query.js";

export interface ReadonlyStateStore<TModel extends Model> {
  from<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
  ): StoreQuery<ModelToType<ModelSchemaFromModels<TModel>[T]>>;
}

export interface WritableStateStore<TModel extends Model>
  extends ReadonlyStateStore<TModel> {
  insertInto<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    record: ModelToType<ModelSchemaFromModels<TModel>[T]>,
  ): AsyncResult<void, StoreQueryError>;
}
