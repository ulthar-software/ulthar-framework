import { ModelSchema } from "../domain/index.js";
import { ModelToType } from "../domain/models/types/model-to-type.js";
import { Keyof } from "../types/keyof.js";
import { StoreQuery } from "./query/query.js";

export interface StateStore<TModels extends ModelSchema> {
  from<TEntityName extends Keyof<TModels>>(
    entityName: TEntityName,
  ): StoreQuery<ModelToType<TModels[TEntityName]>>;
}
