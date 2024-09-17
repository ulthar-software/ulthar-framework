/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToKeys(record: Record<string, any>, prefix = "") {
  return Object.keys(record)
    .map((key) => `${prefix}${key}`)
    .join(", ");
}

/**
 * Unfold a record into a string of it's keys separated by commas.
 */
export function recordToParams(record: Record<string, any>) {
  return Object.keys(record).reduce(
    (acc, key) => ({ ...acc, [`:${key}`]: record[key] }),
    {},
  );
}

export function recordToSQLSet(record: Record<string, any>) {
  return Object.keys(record)
    .map((key) => `${key} = :${key}`)
    .join(", ");
}
