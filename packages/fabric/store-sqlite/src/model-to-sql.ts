/* eslint-disable @typescript-eslint/no-explicit-any */
import { Variant, VariantTag } from "@fabric/core";
import { FieldDefinition, getTargetKey, Model } from "@fabric/domain";

type FieldSQLDefinitionMap = {
  [K in FieldDefinition[VariantTag]]: (
    name: string,
    field: Extract<FieldDefinition, { [VariantTag]: K }>,
  ) => string;
};

const FieldSQLDefinitionMap: FieldSQLDefinitionMap = {
  StringField: (n, f) => {
    return [n, "TEXT", modifiersFromOpts(f)].join(" ");
  },
  UUIDField: (n, f) => {
    return [
      n,
      "TEXT",
      f.isPrimaryKey ? "PRIMARY KEY" : "",
      modifiersFromOpts(f),
    ].join(" ");
  },
  IntegerField: function (n, f): string {
    return [n, "INTEGER", modifiersFromOpts(f)].join(" ");
  },
  ReferenceField: function (n, f): string {
    return [
      n,
      "TEXT",
      modifiersFromOpts(f),
      ",",
      `FOREIGN KEY (${n}) REFERENCES ${f.targetModel}(${getTargetKey(f)})`,
    ].join(" ");
  },
};
function fieldDefinitionToSQL(name: string, field: FieldDefinition) {
  return FieldSQLDefinitionMap[field[VariantTag]](name, field as any);
}

function modifiersFromOpts(field: FieldDefinition) {
  if (Variant.is(field, "UUIDField") && field.isPrimaryKey) {
    return;
  }
  return [
    !field.isOptional ? "NOT NULL" : "",
    field.isUnique ? "UNIQUE" : "",
  ].join(" ");
}

export function modelToSql(
  model: Model<string, Record<string, FieldDefinition>>,
) {
  const fields = Object.entries(model.fields)
    .map(([name, type]) => fieldDefinitionToSQL(name, type))
    .join(", ");

  return `CREATE TABLE ${model.name} (${fields})`;
}
