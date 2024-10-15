import { Model } from "./model.js";

export type ModelSchema = Record<string, Model>;

export type ModelSchemaFromModels<TModels extends Model> = {
  [K in TModels["name"]]: Extract<TModels, { name: K }>;
};
