import { Model, ModelSchemaFromModels, ModelToType } from "@fabric/models";
import {
  StoreDeleteQuery,
  StoreDeleteQueryBuilder,
  StoreInsertQuery,
  StoreInsertQueryBuilder,
  StoreReadQuery,
  StoreReadQueryBuilder,
  StoreUpdateQuery,
} from "./queries/index.ts";
import { StoreUpdateOptions } from "./queries/query-options.ts";
import { StoreUpdateQueryBuilder } from "./queries/update/update-query-builder.ts";
import { ValueStoreDriver } from "./value-store-driver.ts";

export class ReadonlyValueStore<TModel extends Model> {
  constructor(readonly driver: ValueStoreDriver) {}
  from<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreReadQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreReadQueryBuilder(this.driver, { from: modelName });
  }
}

export class WritableValueStore<TModel extends Model>
  extends ReadonlyValueStore<TModel> {
  insertInto<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreInsertQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreInsertQueryBuilder(this.driver, modelName);
  }

  update<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreUpdateQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreUpdateQueryBuilder(this.driver, {
      table: modelName,
      set: {},
    } as StoreUpdateOptions);
  }

  deleteFrom<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreDeleteQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreDeleteQueryBuilder(this.driver, modelName);
  }
}
