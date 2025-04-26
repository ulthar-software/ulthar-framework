/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FieldDefinition,
  FieldToType,
  Model,
  StoreReadOptions,
} from "@fabric/core";
import { JSONExt, PosixDate, VariantTag } from "@fabric/core";

export function transformRow(model: Model, opts: StoreReadOptions) {
  const modelDict: Record<string, Model> = {
    [model.name]: model,
    ...opts.joins?.reduce(
      (acc, j) => {
        acc[j.as] = j.model;
        return acc;
      },
      {} as Record<string, Model>,
    ),
  };
  return (row: Record<string, any>) => {
    const result: Record<string, any> = {};
    for (const key in row) {
      const [modelName, fieldKey] = key.split(".");
      const targetModel = modelDict[modelName];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!targetModel) {
        throw new Error(`Model ${modelName} not found in query options`);
      }
      const field = targetModel.fields[fieldKey] as FieldDefinition;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!field) {
        throw new Error(
          `Field ${fieldKey} not found in model ${targetModel.name}`,
        );
      }
      if (modelName === model.name) {
        result[fieldKey] = valueFromSQL(field, row[key]);
      } else {
        result[key] = valueFromSQL(field, row[key]);
      }
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
  EmbeddedField: (_, v: string) => JSONExt.parse<any>(v).unwrapOrThrow(),
  BooleanField: (_, v) => v,
  EmailField: (_, v) => v,
  EnumField: (_, v) => v,
  UrlField: (_, v) => v,
  ObjectArrayField: (_, v: string) => JSONExt.parse<any>(v).unwrapOrThrow(),
  ArrayField: (_, v: string) => JSONExt.parse<any>(v).unwrapOrThrow(),
};
