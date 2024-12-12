import { StoreInsertOptions } from "@fabric/db";
import { Model } from "@fabric/models";
import {
  manyRecordsToSQLParamRecord,
  recordToSQLKeys,
  recordToSQLParamKeys,
} from "./record-utils.ts";

export function insertToSQL(
  model: Model,
  query: StoreInsertOptions,
  // deno-lint-ignore no-explicit-any
): [string, Record<string, any>] {
  return [
    `INSERT INTO ${query.into} (${
      recordToSQLKeys(
        query.values[0]!,
      )
    }) VALUES ${
      query.values
        .map((v, index) => `(${recordToSQLParamKeys(v, `${index}_`)})`)
        .join(", ")
    }`,
    manyRecordsToSQLParamRecord(model, query.values),
  ];
}
