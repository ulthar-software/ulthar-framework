// deno-lint-ignore-file no-explicit-any

import { Model } from "@fabric/domain";
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
export function recordToSQLKeyParams(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => keyToParam(key))
    .join(", ");
}

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToSQLParams(
  model: Model,
  record: Record<string, any>,
) {
  return Object.keys(record).reduce(
    (acc, key) => ({
      ...acc,
      [keyToParam(key)]: fieldValueToSQL(model.fields[key]!, record[key]),
    }),
    {},
  );
}

export function recordToSQLSet(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => `${key} = ${keyToParam(key)}`)
    .join(", ");
}

export function keyToParam(key: string) {
  return `$${key}`;
}
