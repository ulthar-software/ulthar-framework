import type { Keyof } from "@fabric/core";
import type { FieldToType } from "./fields/field-to-type.ts";
import { Field, type FieldDefinition } from "./fields/index.ts";

export type CustomModelFields = Record<string, FieldDefinition>;

export interface Collection<
  TName extends string = string,
  TFields extends CustomModelFields = CustomModelFields
> {
  name: TName;
  fields: TFields;
}

export const DefaultModelFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  streamId: Field.uuid({ isIndexed: true }),
  streamVersion: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: true,
  }),
  deletedAt: Field.timestamp({ isOptional: true }),
};

export interface Model<
  TName extends string = string,
  TFields extends CustomModelFields = CustomModelFields
> extends Collection<TName, TFields> {
  fields: typeof DefaultModelFields & TFields;
}

export function defineModel<
  TName extends string,
  TFields extends CustomModelFields
>(name: TName, fields: TFields): Model<TName, TFields> {
  return {
    name,
    fields: { ...DefaultModelFields, ...fields },
  } as const;
}

export function defineCollection<
  TName extends string,
  TFields extends CustomModelFields
>(name: TName, fields: TFields): Collection<TName, TFields> {
  return {
    name,
    fields,
  } as const;
}

export type ModelToType<TModel extends Collection> = {
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
