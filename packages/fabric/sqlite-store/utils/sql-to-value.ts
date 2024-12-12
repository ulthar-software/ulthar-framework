// deno-lint-ignore-file no-explicit-any
import { JSONExt, PosixDate, VariantTag } from "@fabric/core";
import { FieldDefinition, FieldToType, Model } from "@fabric/models";

export function transformRow(model: Model) {
  return (row: Record<string, any>) => {
    const result: Record<string, any> = {};
    for (const key in row) {
      const field = model.fields[key]!;
      result[key] = valueFromSQL(field, row[key]);
    }
    return result;
  };
}

function valueFromSQL(field: FieldDefinition, value: any): any {
  if (value === null) {
    return null;
  }
  const r = FieldSQLInsertMap[field[VariantTag]];
  return r(field as any, value);
}

type FieldSQLInsertMap = {
  [K in FieldDefinition[VariantTag]]: (
    field: Extract<FieldDefinition, { [VariantTag]: K }>,
    value: any,
  ) => FieldToType<Extract<FieldDefinition, { [VariantTag]: K }>>;
};
const FieldSQLInsertMap: FieldSQLInsertMap = {
  StringField: (_, v) => v,
  UUIDField: (_, v) => v,
  IntegerField: (f, v) => {
    if (f.hasArbitraryPrecision) {
      return BigInt(v);
    }
    return v;
  },
  ReferenceField: (_, v) => v,
  FloatField: (_, v) => v,
  DecimalField: (_, v) => v,
  PosixDateField: (_, v) => new PosixDate(v),
  EmbeddedField: (_, v: string) => JSONExt.parse(v),
  BooleanField: (_, v) => v,
  EmailField: (_, v) => v,
};
