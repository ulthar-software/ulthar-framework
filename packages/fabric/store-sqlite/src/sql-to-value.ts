/* eslint-disable @typescript-eslint/no-explicit-any */
import { PosixDate, VariantTag } from "@fabric/core";
import { Collection, FieldDefinition, FieldToType } from "@fabric/domain";

export function transformRow(model: Collection) {
  return (row: Record<string, any>) => {
    const result: Record<string, any> = {};
    for (const key in row) {
      const field = model.fields[key];
      result[key] = valueFromSQL(field, row[key]);
    }
    return result;
  };
}

function valueFromSQL(field: FieldDefinition, value: any): any {
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
  StringField: (f, v) => v,
  UUIDField: (f, v) => v,
  IntegerField: (f, v) => {
    if (f.hasArbitraryPrecision) {
      return BigInt(v);
    }
    return v;
  },
  ReferenceField: (f, v) => v,
  FloatField: (f, v) => v,
  DecimalField: (f, v) => v,
  TimestampField: (f, v) => new PosixDate(v),
  EmbeddedField: (f, v: string) => JSON.parse(v),
};
