// deno-lint-ignore-file no-explicit-any
import { Effect, Keyof, Optional } from "@fabric/core";
import {
  AlreadyExistsError,
  FilterOptions,
  Model,
  type ModelSchema,
  NotFoundError,
  OrderByOptions,
  SelectableQuery,
  StoreLimitableQuery,
  StoreQuery,
  StoreQueryDefinition,
  StoreQueryError,
  StoreSortableQuery,
} from "@fabric/domain";
import { filterToParams, filterToSQL } from "../sqlite/filter-to-sql.ts";
import { transformRow } from "../sqlite/sql-to-value.ts";
import { SQLiteDatabase } from "../sqlite/sqlite-database.ts";

export class QueryBuilder<T> implements StoreQuery<T> {
  constructor(
    private db: SQLiteDatabase,
    private schema: ModelSchema,
    private query: StoreQueryDefinition,
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
      offset: offset ?? 0,
    });
  }

  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;
  select<K extends Keyof<T>>(keys?: K[]): Effect<any, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        const [sql, params] = getSelectStatement(
          this.schema[this.query.from]!,
          {
            ...this.query,
            keys: keys!,
          },
        );
        return this.db.allPrepared(
          sql,
          params,
          transformRow(this.schema[this.query.from]!),
        );
      },
      (err) => new StoreQueryError(err.message),
    );
  }

  selectOne(): Effect<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Optional<Pick<T, K>>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(keys?: K[]): Effect<any, StoreQueryError> {
    return Effect.tryFrom(
      async () => {
        const [stmt, params] = getSelectStatement(
          this.schema[this.query.from]!,
          {
            ...this.query,
            keys: keys!,
            limit: 1,
          },
        );
        return await this.db.onePrepared(
          stmt,
          params,
          transformRow(this.schema[this.query.from]!),
        );
      },
      (err) => new StoreQueryError(err.message),
    );
  }

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Extract<keyof T, string>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Extract<keyof T, string>>(
    keys?: K[],
  ): Effect<any, StoreQueryError | NotFoundError> {
    return Effect.tryFrom(
      async () => {
        const [stmt, params] = getSelectStatement(
          this.schema[this.query.from]!,
          {
            ...this.query,
            keys: keys!,
            limit: 1,
          },
        );
        return await this.db.onePrepared(
          stmt,
          params,
          transformRow(this.schema[this.query.from]!),
        );
      },
      (err) => new StoreQueryError(err.message),
    ).flatMap((result) => {
      if (!result) {
        return Effect.failWith(new NotFoundError());
      }
      return Effect.ok(result);
    });
  }

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError> {
    return Effect.tryFrom(
      async () => {
        const [stmt, params] = getSelectStatement(
          this.schema[this.query.from]!,
          {
            ...this.query,
            limit: 1,
          },
        );
        return await this.db.onePrepared(
          stmt,
          params,
        );
      },
      (err) => new StoreQueryError(err.message),
    ).flatMap((result) => {
      if (result) {
        return Effect.failWith(new AlreadyExistsError());
      }
      return Effect.ok();
    });
  }
}

export function getSelectStatement(
  collection: Model,
  query: StoreQueryDefinition,
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
