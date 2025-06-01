/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Model, StoreUpdateOptions } from "@fabric/core";
import { filterToParams, filterToSQL } from "./filter-to-sql.js";
import { identifierToSQL } from "./identifier-to-sql.js";
import { recordToSqlParamRecord, recordToSqlSet } from "./record-utils.js";

export function updateToSql(
  model: Model,
  query: StoreUpdateOptions,
): [string, Record<string, any>] {
  return [
    `UPDATE ${identifierToSQL(model.name)} SET ${recordToSqlSet(
      query.set,
    )} ${filterToSQL(model, query.where)}`,
    {
      ...recordToSqlParamRecord(model, {
        ...query.set,
      }),
      ...filterToParams(model, [], query.where),
    },
  ];
}
