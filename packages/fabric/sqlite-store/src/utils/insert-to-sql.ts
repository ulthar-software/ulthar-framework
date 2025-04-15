/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Model, StoreInsertOptions } from "@fabric/core";
import {
  manyRecordsToSqlParamRecord,
  recordToSqlKeys,
  recordToSqlParamKeys,
} from "./record-utils.js";

export function insertToSql(
  model: Model,
  query: StoreInsertOptions,
): [string, Record<string, any>] {
  return [
    `INSERT INTO ${query.into} (${recordToSqlKeys(
      model,
      query.values[0],
    )}) VALUES ${query.values
      .map((v, index) => `(${recordToSqlParamKeys(model, v, `${index}_`)})`)
      .join(", ")}`,
    manyRecordsToSqlParamRecord(model, query.values),
  ];
}
