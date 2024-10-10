import { Collection } from "./model.js";

export type ModelSchema = Record<string, Collection>;

export type ModelSchemaFromModels<TModels extends Collection> = {
  [K in TModels["name"]]: Extract<TModels, { name: K }>;
};
