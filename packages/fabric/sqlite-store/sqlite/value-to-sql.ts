// deno-lint-ignore-file no-explicit-any
import { JSONUtils, VariantTag } from "@fabric/core";
import { FieldDefinition, FieldToType } from "@fabric/domain";
import { isNullish } from "@fabric/validations";

type FieldSQLInsertMap = {
  [K in FieldDefinition[VariantTag]]: (
    field: Extract<FieldDefinition, { [VariantTag]: K }>,
    value: FieldToType<Extract<FieldDefinition, { [VariantTag]: K }>>,
  ) => any;
};
const FieldSQLInsertMap: FieldSQLInsertMap = {
  StringField: (_, v) => v,
  UUIDField: (_, v) => v,
  IntegerField: (f, v: number | bigint) => {
    if (f.hasArbitraryPrecision) {
      return String(v);
    }
    return v as number;
  },
  ReferenceField: (_, v) => v,
  FloatField: (_, v) => v,
  DecimalField: (_, v) => v,
  PosixDateField: (_, v) => v.timestamp,
  EmbeddedField: (_, v: string) => JSONUtils.stringify(v),
  BooleanField: (_, v) => v,
  EmailField: (_, v) => v,
};

export function fieldValueToSQL(field: FieldDefinition, value: any) {
  if (isNullish(value)) {
    return null;
  }
  const r = FieldSQLInsertMap[field[VariantTag]] as any;
  return r(field as any, value);
}
