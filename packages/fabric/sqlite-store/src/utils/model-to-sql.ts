/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/naming-convention */
import { Variant, VariantTag } from "@fabric/core";
import {
  type FieldDefinition,
  getTargetKey,
  type Model,
  type ModelConstraint,
} from "@fabric/models";

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
    ]
      .filter((x) => x)
      .join(" ");
  },
  IntegerField: (n, f): string => {
    return [n, "INTEGER", modifiersFromOpts(f)].join(" ");
  },
  ReferenceField: (n, f): string => {
    return [
      n,
      "TEXT",
      modifiersFromOpts(f),
      `REFERENCES ${f.targetModel}(${getTargetKey(f)})`,
    ].join(" ");
  },
  FloatField: (n, f): string => {
    return [n, "REAL", modifiersFromOpts(f)].join(" ");
  },
  DecimalField: (n, f): string => {
    return [n, "REAL", modifiersFromOpts(f)].join(" ");
  },
  PosixDateField: (n, f): string => {
    return [n, "NUMERIC", modifiersFromOpts(f)].join(" ");
  },
  EmbeddedField: (n, f): string => {
    return [n, "TEXT", modifiersFromOpts(f)].join(" ");
  },
  BooleanField: (n, f): string => {
    return [n, "BOOLEAN", modifiersFromOpts(f)].join(" ");
  },
  EmailField: (n, f): string => {
    return [n, "TEXT", modifiersFromOpts(f)].join(" ");
  },
  EnumField: (n, f): string => {
    return [n, "TEXT", modifiersFromOpts(f)].join(" ");
  },
  UrlField: (n, f): string => {
    return [n, "TEXT", modifiersFromOpts(f)].join(" ");
  },
};
function fieldDefinitionToSQL(name: string, field: FieldDefinition) {
  return FieldSQLDefinitionMap[field[VariantTag]](name, field as any);
}

function modifiersFromOpts(field: FieldDefinition) {
  if (Variant.is(field, "UUIDField") && field.isPrimaryKey) {
    return;
  }
  return [!field.isOptional ? "NOT NULL" : "", field.isUnique ? "UNIQUE" : ""]
    .filter((x) => x)
    .join(" ");
}

function generateSQLConstraint(constraint: ModelConstraint) {
  switch (constraint.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case "unique":
      return `UNIQUE(${constraint.fields.join(", ")})`;

    default:
      // eslint-disable-next-line no-case-declarations
      const exhaustiveCheck: never = constraint.type;
      return exhaustiveCheck;
  }
}

export function modelToSql(
  model: Model<string, Record<string, FieldDefinition>>,
) {
  const fields = Object.entries(model.fields)
    .map(([name, type]) => fieldDefinitionToSQL(name, type))
    .join(", ");

  const constraints = (
    model.opts.constraints?.map(generateSQLConstraint) ?? []
  ).join(", ");

  const fieldsAndConstraints = [fields, constraints]
    .filter((x) => x)
    .join(", ");

  return `CREATE TABLE ${model.name} (${fieldsAndConstraints})`;
}
