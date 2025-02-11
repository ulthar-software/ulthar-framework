/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type CircularDependencyError,
  sortByDependencies,
} from "@fabric/algorithms/sort-by-dependencies";
import { Effect } from "@fabric/core";
import {
  type StoreDeleteOptions,
  type StoreInsertOptions,
  StoreQueryError,
  type StoreReadOptions,
  type StoreUpdateOptions,
  type ValueStoreDriver,
} from "@fabric/db";
import type { Model } from "@fabric/models";
import Sqlite3, { type Database, type Statement } from "better-sqlite3";
import { filterToParams, filterToSQL } from "./utils/filter-to-sql.js";
import { insertToSql } from "./utils/insert-to-sql.js";
import { modelToSql } from "./utils/model-to-sql.js";
import { transformRow } from "./utils/sql-to-value.js";
import { updateToSql } from "./utils/update-to-sql.js";

export class SQLiteStoreDriver implements ValueStoreDriver {
  db: Database;

  private cachedStatements = new Map<string, Statement>();

  constructor(private readonly path: string) {
    this.db = new Sqlite3(path);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  sync(
    models: Model[],
  ): Effect<void, CircularDependencyError | StoreQueryError> {
    return Effect.fromResult(() =>
      sortByDependencies(models, {
        keyGetter: (model) => model.name,
        depsGetter: (model) =>
          model.getReferences().map((ref) => ref.targetModel),
      }),
    ).tryMap(
      (sortedModels) => {
        sortedModels.map((model) => {
          this.db.exec(modelToSql(model));
        });
      },
      (error: Error) => new StoreQueryError(error.message),
    );
  }

  get<T>(model: Model, query: StoreReadOptions): Effect<T[], StoreQueryError> {
    return Effect.tryFrom(
      () => {
        const [sql, params] = this.getSelectStatement(model, query);
        return this.allPrepared(sql, params, transformRow(model)) as T[];
      },
      (error: Error) => new StoreQueryError(error.message),
    );
  }
  insert(
    model: Model,
    query: StoreInsertOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        this.runPrepared(...insertToSql(model, query));
      },
      (error: Error) => new StoreQueryError(error.message),
    );
  }
  update(
    model: Model,
    query: StoreUpdateOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        this.runPrepared(...updateToSql(model, query));
      },
      (error: Error) => new StoreQueryError(error.message),
    );
  }
  delete(
    model: Model,
    query: StoreDeleteOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        this.runPrepared(
          `DELETE FROM ${query.from} ${filterToSQL(query.where)}`,
          {
            ...filterToParams(model, query.where),
          },
        );
      },
      (error: Error) => new StoreQueryError(error.message),
    );
  }

  close(): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        this.db.close();
      },
      (error: Error) => new StoreQueryError(error.message),
    );
  }

  private runPrepared(sql: string, params?: Record<string, any>) {
    const cachedStmt = this.getCachedStatement(sql);
    cachedStmt.run(params);
  }

  private allPrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ): any[] {
    const cachedStmt = this.getCachedStatement(sql);

    const result = cachedStmt.all(params);

    return transformer ? result.map(transformer) : result;
  }

  private getCachedStatement(sql: string) {
    let cached = this.cachedStatements.get(sql);

    if (!cached) {
      const stmt = this.db.prepare(sql);
      this.cachedStatements.set(sql, stmt);
      cached = stmt;
    }
    return cached;
  }

  private getSelectStatement(
    model: Model,
    query: StoreReadOptions,
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
        ...filterToParams(model, query.where),
      },
    ];
  }
}
