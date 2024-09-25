import { Keyof } from "@fabric/core";
import { ModelToType } from "../models/index.js";
import { ModelSchema } from "../models/model-schema.js";
import { QueryBuilder } from "../query/query-builder.js";
import { StoreQuery } from "../query/query.js";
import { StorageDriver } from "./storage-driver.js";

export class StateStore<TModels extends ModelSchema> {
  constructor(private driver: StorageDriver) {}

  from<TEntityName extends Keyof<TModels>>(
    entityName: TEntityName,
  ): StoreQuery<ModelToType<TModels[TEntityName]>> {
    return new QueryBuilder(this.driver, {
      from: entityName,
    }) as StoreQuery<ModelToType<TModels[TEntityName]>>;
  }
}
