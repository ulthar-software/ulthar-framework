/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Model } from "@fabric/core";
import { fieldValueToSQL } from "./value-to-sql.js";

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSqlKeys(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => key)
    .join(", ");
}
/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSqlParamKeys(record: Record<string, any>, prefix = "") {
  return Object.keys(record)
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
  return Object.keys(record).reduce(
    (acc, key) => ({
      ...acc,
      [`${prefix}${key}`]: fieldValueToSQL(model.fields[key], record[key]),
    }),
    {},
  );
}
export function manyRecordsToSqlParamRecord(
  model: Model<string, any>,
  records: Record<string, any>[],
) {
  return records
    .map((record, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
