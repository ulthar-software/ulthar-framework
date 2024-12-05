import { type Keyof } from "@fabric/core";
import { type FieldDefinition, type FieldToType } from "./fields.ts";

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
  private constructor(readonly name: TName, readonly fields: TFields) {}
}

export type ModelToType<TModel extends Model> =
  & ModelToOptionalFields<TModel>
  & ModelToRequiredFields<TModel>;

export type ModelFieldNames<TModel extends ModelFields> = Keyof<
  TModel["fields"]
>;

/**
 * Extracts the names of the fields that are addressable, i.e. have the isUnique flag set to true.
 */
export type ModelAddressableFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends { isUnique: true }
    ? K
    : never;
}[Keyof<TModel["fields"]>];

export type ModelSchema = Record<string, Model>;

export type ModelSchemaFromModels<TModels extends Model> = {
  [K in TModels["name"]]: Extract<TModels, { name: K }>;
};

type ModelFields = Record<string, FieldDefinition>;

type ModelToOptionalFields<TModel extends Model> = {
  [K in OptionalFields<TModel>]?: FieldToType<
    TModel["fields"][K]
  >;
};

type ModelToRequiredFields<TModel extends Model> = {
  [K in RequiredFields<TModel>]: FieldToType<
    TModel["fields"][K]
  >;
};

type OptionalFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends {
    isOptional: true;
  } ? K
    : never;
}[Keyof<TModel["fields"]>];

type RequiredFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends {
    isOptional: true;
  } ? never
    : K;
}[Keyof<TModel["fields"]>];
