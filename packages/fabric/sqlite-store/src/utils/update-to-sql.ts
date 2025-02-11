/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StoreUpdateOptions } from "@fabric/db";
import type { Model } from "@fabric/models";
import { filterToParams, filterToSQL } from "./filter-to-sql.js";
import { recordToSqlParamRecord, recordToSqlSet } from "./record-utils.js";

export function updateToSql(
  model: Model,
  query: StoreUpdateOptions,
): [string, Record<string, any>] {
  return [
    `UPDATE ${model.name} SET ${recordToSqlSet(
      query.set,
    )} ${filterToSQL(query.where)}`,
    {
      ...recordToSqlParamRecord(model, {
        ...query.set,
      }),
      ...filterToParams(model, query.where),
    },
  ];
}
