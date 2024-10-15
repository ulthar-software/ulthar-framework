/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncResult, Keyof, Optional } from "@fabric/core";
import {
  Collection,
  FilterOptions,
  ModelSchema,
  OrderByOptions,
  QueryDefinition,
  SelectableQuery,
  StoreLimitableQuery,
  StoreQuery,
  StoreQueryError,
  StoreSortableQuery,
} from "@fabric/domain";
import { filterToParams, filterToSQL } from "../sqlite/filter-to-sql.js";
import { transformRow } from "../sqlite/sql-to-value.js";
import { SQLiteDatabase } from "../sqlite/sqlite-database.js";

export class QueryBuilder<T> implements StoreQuery<T> {
  constructor(
    private db: SQLiteDatabase,
    private schema: ModelSchema,
    private query: QueryDefinition,
  ) {}

  where(where: FilterOptions<T>): StoreSortableQuery<T> {
    return new QueryBuilder(this.db, this.schema, {
      ...this.query,
      where,
    });
  }

  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T> {
    return new QueryBuilder(this.db, this.schema, {
      ...this.query,
      orderBy: opts,
    });
  }

  limit(limit: number, offset?: number | undefined): SelectableQuery<T> {
    return new QueryBuilder(this.db, this.schema, {
      ...this.query,
      limit,
      offset,
    });
  }

  select(): AsyncResult<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError>;
  select<K extends Keyof<T>>(keys?: K[]): AsyncResult<any, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const [sql, params] = getSelectStatement(this.schema[this.query.from], {
          ...this.query,
          keys,
        });
        return this.db.allPrepared(
          sql,
          params,
          transformRow(this.schema[this.query.from]),
        );
      },
      (err) => new StoreQueryError(err.message),
    );
  }

  selectOne(): AsyncResult<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K,
  ): AsyncResult<Optional<Pick<T, K>>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(keys?: K[]): AsyncResult<any, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const [stmt, params] = getSelectStatement(
          this.schema[this.query.from],
          {
            ...this.query,
            keys,
            limit: 1,
          },
        );
        return await this.db.onePrepared(
          stmt,
          params,
          transformRow(this.schema[this.query.from]),
        );
      },
      (err) => new StoreQueryError(err.message),
    );
  }
}

export function getSelectStatement(
  collection: Collection,
  query: QueryDefinition,
): [string, Record<string, any>] {
  const selectFields = query.keys ? query.keys.join(", ") : "*";

  const queryFilter = filterToSQL(query.where);
  const limit = query.limit ? `LIMIT ${query.limit}` : "";
  const offset = query.offset ? `OFFSET ${query.offset}` : "";

  const sql = [
    `SELECT ${selectFields}`,
    `FROM ${query.from}`,
    queryFilter,
    limit,
    offset,
  ].join(" ");

  return [
    sql,
    {
      ...filterToParams(collection, query.where),
    },
  ];
}
