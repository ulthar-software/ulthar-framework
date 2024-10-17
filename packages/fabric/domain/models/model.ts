import type { Keyof } from "@fabric/core";
import type { CustomModelFields } from "./custom-model-fields.ts";
import type { FieldToType } from "./fields/field-to-type.ts";

export interface Model<
  TName extends string = string,
  TFields extends CustomModelFields = CustomModelFields,
> {
  name: TName;
  fields: TFields;
}

export function defineModel<
  TName extends string,
  TFields extends CustomModelFields,
>(name: TName, fields: TFields): Model<TName, TFields> {
  return {
    name,
    fields,
  } as const;
}

export type ModelToType<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: FieldToType<TModel["fields"][K]>;
};

export type ModelFieldNames<TModel extends CustomModelFields> = Keyof<
  TModel["fields"]
>;
