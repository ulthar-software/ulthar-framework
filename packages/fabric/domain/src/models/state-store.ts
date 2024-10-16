import type { AsyncResult } from "@fabric/core";
import type { StoreQueryError } from "../errors/query-error.ts";
import type { ModelSchemaFromModels } from "./model-schema.ts";
import type { Model, ModelToType } from "./model.ts";
import type { StoreQuery } from "./query/query.ts";

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
