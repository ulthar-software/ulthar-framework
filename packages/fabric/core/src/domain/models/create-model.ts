import { FieldDefinition } from "./fields/index.js";

export interface ModelDefinition<
  TName extends string = string,
  TFields extends Record<string, FieldDefinition> = Record<
    string,
    FieldDefinition
  >,
> {
  name: TName;
  fields: TFields;
}

export type ModelName<
  TModel extends ModelDefinition<string, Record<string, FieldDefinition>>,
> = TModel["name"];

export type ModelFromName<
  TModels extends ModelDefinition<string, Record<string, FieldDefinition>>,
  TName extends ModelName<TModels>,
> = Extract<TModels, { name: TName }>;

export type ModelFieldNames<
  TModel extends ModelDefinition<string, Record<string, FieldDefinition>>,
> = keyof TModel["fields"];

export function createModel<
  TName extends string,
  TFields extends Record<string, FieldDefinition>,
>(opts: ModelDefinition<TName, TFields>): ModelDefinition<TName, TFields> {
  return opts;
}
