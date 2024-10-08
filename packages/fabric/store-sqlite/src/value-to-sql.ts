/* eslint-disable @typescript-eslint/no-explicit-any */
import { VariantTag } from "@fabric/core";
import { FieldDefinition, FieldToType } from "@fabric/domain";

type FieldSQLInsertMap = {
  [K in FieldDefinition[VariantTag]]: (
    field: Extract<FieldDefinition, { [VariantTag]: K }>,
    value: FieldToType<Extract<FieldDefinition, { [VariantTag]: K }>>,
  ) => any;
};
const FieldSQLInsertMap: FieldSQLInsertMap = {
  StringField: (f, v) => v,
  UUIDField: (f, v) => v,
  IntegerField: (f, v: number | bigint) => {
    if (f.hasArbitraryPrecision) {
      return String(v);
    }
    return v as number;
  },
  ReferenceField: (f, v) => v,
  FloatField: (f, v) => v,
  DecimalField: (f, v) => v,
};

export function fieldValueToSQL(field: FieldDefinition, value: any) {
  const r = FieldSQLInsertMap[field[VariantTag]] as any;
  return r(field as any, value);
}
