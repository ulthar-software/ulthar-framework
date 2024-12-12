import { Effect } from "@fabric/core";
import { Model, ModelSchemaFromModels, ModelToType } from "@fabric/models";
import { CircularDependencyError } from "@fabric/utils/sort-by-dependencies";
import { StoreQueryError } from "./errors/store-query-error.ts";
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
  protected readonly modelSchema: ModelSchemaFromModels<TModel>;

  constructor(
    protected readonly driver: ValueStoreDriver,
    protected readonly models: TModel[],
  ) {
    // deno-lint-ignore no-explicit-any
    this.modelSchema = models.reduce((acc: any, model) => {
      acc[model.name] = model;
      return acc;
    }, {}) as ModelSchemaFromModels<TModel>;
  }

  from<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreReadQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreReadQueryBuilder(this.driver, this.modelSchema[modelName], {
      from: modelName,
    });
  }

  close(): Effect<void, StoreQueryError> {
    return this.driver.close();
  }
}

export class WritableValueStore<TModel extends Model>
  extends ReadonlyValueStore<TModel> {
  insertInto<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreInsertQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreInsertQueryBuilder(
      this.driver,
      this.modelSchema[modelName],
      modelName,
    );
  }

  update<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreUpdateQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreUpdateQueryBuilder(
      this.driver,
      this.modelSchema[modelName],
      {
        table: modelName,
        set: {},
      } as StoreUpdateOptions,
    );
  }

  deleteFrom<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreDeleteQuery<ModelToType<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreDeleteQueryBuilder(
      this.driver,
      this.modelSchema[modelName],
      modelName,
    );
  }

  sync(): Effect<void, CircularDependencyError | StoreQueryError> {
    return this.driver.sync(this.models);
  }
}
