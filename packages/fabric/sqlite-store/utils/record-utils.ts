// deno-lint-ignore-file no-explicit-any

import { Model } from "@fabric/models";
import { fieldValueToSQL } from "./value-to-sql.ts";

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSQLKeys(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => key)
    .join(", ");
}
/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSQLParamKeys(record: Record<string, any>, prefix = "") {
  return Object.keys(record)
    .map((key) => keyToParamKey(`${prefix}${key}`))
    .join(", ");
}

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSQLParamRecord(
  model: Model,
  record: Record<string, any>,
  prefix = "",
) {
  return Object.keys(record).reduce(
    (acc, key) => ({
      ...acc,
      [keyToParamKey(`${prefix}${key}`)]: fieldValueToSQL(
        model.fields[key]!,
        record[key],
      ),
    }),
    {},
  );
}
export function manyRecordsToSQLParamRecord(
  model: Model,
  records: Record<string, any>[],
) {
  return records.map((record, index) => {
    return recordToSQLParamRecord(model, record, `${index}_`);
  }).reduce((acc, record) => ({ ...acc, ...record }), {});
}

export function recordToSQLSet(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => `${key} = ${keyToParamKey(key)}`)
    .join(", ");
}

export function keyToParamKey(key: string) {
  return `$${key}`;
}
