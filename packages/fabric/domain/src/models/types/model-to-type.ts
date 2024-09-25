import { FieldToType } from "../fields/field-to-type.js";
import { Model } from "../model.js";

export type ModelToType<TModel extends Model> = {
  [K in keyof TModel]: FieldToType<TModel[K]>;
};
