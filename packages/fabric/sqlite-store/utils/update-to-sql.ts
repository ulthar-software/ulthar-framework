import { StoreUpdateOptions } from "@fabric/db";
import { Model } from "@fabric/models";
import { filterToParams, filterToSQL } from "./filter-to-sql.ts";
import { recordToSQLParamRecord, recordToSQLSet } from "./record-utils.ts";

export function updateToSQL(
  model: Model,
  query: StoreUpdateOptions,
  // deno-lint-ignore no-explicit-any
): [string, Record<string, any>] {
  return [
    `UPDATE ${model.name} SET ${
      recordToSQLSet(
        query.set,
      )
    } ${filterToSQL(query.where)}`,
    {
      ...recordToSQLParamRecord(model, {
        ...query.set,
      }),
      ...filterToParams(model, query.where),
    },
  ];
}
