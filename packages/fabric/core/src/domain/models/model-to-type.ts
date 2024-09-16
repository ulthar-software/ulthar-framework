import { ModelDefinition } from "./create-model.js";
import { FieldToType } from "./fields/field-to-type.js";

export type ModelToType<TModel extends ModelDefinition> = {
  [K in keyof TModel["fields"]]: FieldToType<TModel["fields"][K]>;
};
