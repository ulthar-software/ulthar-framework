/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldDefinition, Model } from "@fabric/core";
import { fieldValueToSQL } from "./value-to-sql.js";

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSqlKeys(model: Model, record: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const modelKeys = Object.keys(model.fields);
  return Object.keys(record)
    .filter((key) => modelKeys.includes(key))
    .map((key) => key)
    .join(", ");
}
/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSqlParamKeys(
  model: Model,
  record: Record<string, any>,
  prefix = "",
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const modelKeys = Object.keys(model.fields);
  return Object.keys(record)
    .filter((key) => modelKeys.includes(key))
    .map((key) => keyToParamKey(`${prefix}${key}`))
    .join(", ");
}

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSqlParamRecord(
  model: Model,
  record: Record<string, any>,
  prefix = "",
) {
  return Object.keys(record).reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const field: FieldDefinition | undefined = model.fields[key];
    if (!field) {
      //if the field is not defined in the model, we skip it
      return acc;
    }
    return {
      ...acc,
      [`${prefix}${key}`]: fieldValueToSQL(field, record[key]),
    };
  }, {});
}
export function manyRecordsToSqlParamRecord(
  model: Model,
  records: Record<string, any>[],
) {
  return records
    .map((record, index) => {
      return recordToSqlParamRecord(model, record, `${index}_`);
    })
    .reduce((acc, record) => ({ ...acc, ...record }), {});
}

export function recordToSqlSet(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => `${key} = ${keyToParamKey(key)}`)
    .join(", ");
}

export function keyToParamKey(key: string) {
  return `$${key}`;
}
