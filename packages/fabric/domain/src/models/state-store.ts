import { AsyncResult } from "@fabric/core";
import { StoreQueryError } from "../errors/query-error.js";
import { StorageDriver } from "../storage/storage-driver.js";
import { ModelSchemaFromModels } from "./model-schema.js";
import { Model, ModelToType } from "./model.js";

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

  async migrate(): AsyncResult<void, StoreQueryError> {
    await this.driver.sync(this.schema);
  }

  async insertInto<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    record: ModelToType<ModelSchemaFromModels<TModel>[T]>,
  ): AsyncResult<void, StoreQueryError> {
    return this.driver.insert(this.schema[collection], record);
  }
}
