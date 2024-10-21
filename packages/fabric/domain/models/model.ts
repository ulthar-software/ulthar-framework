import type { Keyof } from "@fabric/core";
import type { FieldToType } from "./fields/field-to-type.ts";
import { Field, type FieldDefinition } from "./fields/index.ts";

/**
 * A model is a schema definition for some type of structured data.
 */
export class Model<
  TName extends string = string,
  TFields extends ModelFields = ModelFields,
> {
  static from<TName extends string, TFields extends ModelFields>(
    name: TName,
    fields: TFields,
  ) {
    return new Model(name, fields);
  }

  static aggregateFrom<TName extends string, TFields extends ModelFields>(
    name: TName,
    fields: TFields,
  ): Model<TName, TFields & typeof DefaultAggregateFields> {
    return new Model(name, { ...fields, ...DefaultAggregateFields });
  }

  static entityFrom<TName extends string, TFields extends ModelFields>(
    name: TName,
    fields: TFields,
  ): Model<TName, TFields & typeof DefaultEntityFields> {
    return new Model(name, { ...fields, ...DefaultEntityFields });
  }
  private constructor(readonly name: TName, readonly fields: TFields) {}
}

export type EntityModel = Model<
  string,
  typeof DefaultEntityFields & ModelFields
>;

export type AggregateModel = Model<
  string,
  typeof DefaultAggregateFields & ModelFields
>;

export type ModelToType<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: FieldToType<TModel["fields"][K]>;
};

export type ModelFieldNames<TModel extends ModelFields> = Keyof<
  TModel["fields"]
>;

export type ModelAddressableFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends { isUnique: true }
    ? K
    : never;
}[Keyof<TModel["fields"]>];

type ModelFields = Record<string, FieldDefinition>;

const DefaultEntityFields = {
  id: Field.uuid({ isPrimaryKey: true }),
} as const;

const DefaultAggregateFields = {
  ...DefaultEntityFields,
  streamId: Field.uuid({ isIndexed: true }),
  streamVersion: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: true,
  }),
  deletedAt: Field.timestamp({ isOptional: true }),
} as const;
