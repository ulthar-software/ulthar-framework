import { AsyncResult } from "@fabric/core";
import { CircularDependencyError } from "../errors/circular-dependency-error.js";
import { StoreQueryError } from "../errors/query-error.js";
import { StorageDriver } from "../storage/storage-driver.js";
import { ModelSchemaFromModels } from "./model-schema.js";
import { Model, ModelToType } from "./model.js";
import { QueryBuilder } from "./query/query-builder.js";
import { StoreQuery } from "./query/query.js";

export class StateStore<TModel extends Model> {
  private schema: ModelSchemaFromModels<TModel>;
  constructor(
    private driver: StorageDriver,
    models: TModel[],
  ) {
    this.schema = models.reduce((acc, model: TModel) => {
      return {
        ...acc,
        [model.name]: model,
      };
    }, {} as ModelSchemaFromModels<TModel>);
  }

  migrate(): AsyncResult<void, StoreQueryError | CircularDependencyError> {
    return this.driver.sync(this.schema);
  }

  async insertInto<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    record: ModelToType<ModelSchemaFromModels<TModel>[T]>,
  ): AsyncResult<void, StoreQueryError> {
    return this.driver.insert(this.schema[collection], record);
  }

  from<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
  ): StoreQuery<ModelToType<ModelSchemaFromModels<TModel>[T]>> {
    return new QueryBuilder(this.driver, this.schema, {
      from: collection,
    }) as StoreQuery<ModelToType<ModelSchemaFromModels<TModel>[T]>>;
  }
}
