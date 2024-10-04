import { Keyof } from "@fabric/core";
import { FieldToType } from "./fields/field-to-type.js";
import { Field, FieldDefinition } from "./fields/index.js";

export type CustomModelFields = Record<string, FieldDefinition>;

export const DefaultModelFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  streamId: Field.uuid({ isIndexed: true }),
  streamVersion: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: true,
  }),
};
export interface Model<
  TName extends string = string,
  TFields extends CustomModelFields = CustomModelFields,
> {
  name: TName;
  fields: typeof DefaultModelFields & TFields;
}

export function defineModel<
  TName extends string,
  TFields extends CustomModelFields,
>(name: TName, fields: TFields): Model<TName, TFields> {
  return {
    name,
    fields: { ...DefaultModelFields, ...fields },
  } as const;
}

export type ModelToType<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: FieldToType<TModel["fields"][K]>;
};

export type ModelFieldNames<TModel extends CustomModelFields> = Keyof<
  TModel["fields"]
>;

export type ModelAddressableFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends { isUnique: true }
    ? K
    : never;
}[Keyof<TModel["fields"]>];
