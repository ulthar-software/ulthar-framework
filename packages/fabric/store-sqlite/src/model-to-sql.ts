/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseField,
  FieldDefinition,
  ModelDefinition,
  VariantTag,
} from "@ulthar/fabric-core";

type FieldMap = {
  [K in FieldDefinition[VariantTag]]: (
    field: Extract<FieldDefinition, { [VariantTag]: K }>,
  ) => string;
};

const FieldMap: FieldMap = {
  StringField: (f) => {
    return "TEXT" + modifiersFromOpts(f);
  },
  UUIDField: (f) => {
    return [
      "TEXT",
      f.isPrimaryKey ? "PRIMARY KEY" : "",
      modifiersFromOpts(f),
    ].join(" ");
  },
};

function modifiersFromOpts(options: BaseField) {
  return [
    !options.isOptional ? "NOT NULL" : "",
    options.isUnique ? "UNIQUE" : "",
  ].join(" ");
}

function fieldDefinitionToSQL(field: FieldDefinition) {
  return FieldMap[field[VariantTag]](field as any);
}

export function modelToSql(
  model: ModelDefinition<string, Record<string, FieldDefinition>>,
) {
  return Object.entries(model.fields)
    .map(([name, type]) => `${name} ${fieldDefinitionToSQL(type)}`)
    .join(", ");
}
