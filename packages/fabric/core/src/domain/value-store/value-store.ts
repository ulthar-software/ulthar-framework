/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect } from "../../effect/effect.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import type { Infer, Model, ModelSchemaFromModels } from "../models/index.js";
import type { StoreQueryError } from "./errors/store-query-error.js";
import {
  type StoreDeleteQuery,
  StoreDeleteQueryBuilder,
  type StoreInsertQuery,
  StoreInsertQueryBuilder,
  type StoreReadQuery,
  StoreReadQueryBuilder,
  type StoreUpdateQuery,
} from "./queries/index.js";
import type { StoreUpdateOptions } from "./queries/query-options.js";
import { StoreUpdateQueryBuilder } from "./queries/update/update-query-builder.js";
import type { ValueStoreDriver } from "./value-store-driver.js";

export class ReadonlyValueStore<TModel extends Model> {
  protected readonly modelSchema: ModelSchemaFromModels<TModel>;

  constructor(
    protected readonly driver: ValueStoreDriver,
    protected readonly models: TModel[],
  ) {
    this.modelSchema = models.reduce((acc: any, model) => {
      acc[model.name] = model;
      return acc;
    }, {}) as ModelSchemaFromModels<TModel>;
  }

  from<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreReadQuery<Infer<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreReadQueryBuilder(this.driver, this.modelSchema[modelName], {
      from: modelName,
    });
  }

  close(): Effect<void, StoreQueryError> {
    return this.driver.close();
  }
}

export class WritableValueStore<
  TModel extends Model,
> extends ReadonlyValueStore<TModel> {
  insertInto<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreInsertQuery<Infer<ModelSchemaFromModels<TModel>[TKey]>> {
    return new StoreInsertQueryBuilder(
      this.driver,
      this.modelSchema[modelName],
      modelName,
    );
  }

  update<TKey extends keyof ModelSchemaFromModels<TModel>>(
    modelName: TKey,
  ): StoreUpdateQuery<Infer<ModelSchemaFromModels<TModel>[TKey]>> {
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
  ): StoreDeleteQuery<Infer<ModelSchemaFromModels<TModel>[TKey]>> {
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
