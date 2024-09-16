/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ModelDefinition,
  ModelFromName,
  ModelName,
} from "../domain/models/create-model.js";
import { ModelToType } from "../domain/models/model-to-type.js";
import { StoreQuery } from "./query/query.js";

export interface StateStore<
  TModels extends ModelDefinition<string, Record<string, any>>,
> {
  from<TEntityName extends ModelName<TModels>>(
    entityName: TEntityName,
  ): StoreQuery<ModelToType<ModelFromName<TModels, TEntityName>>>;
}
