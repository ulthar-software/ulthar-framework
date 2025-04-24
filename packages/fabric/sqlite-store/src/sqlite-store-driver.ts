/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Effect,
  sortByDependencies,
  StoreQueryError,
  type CircularDependencyError,
  type Model,
  type StoreDeleteOptions,
  type StoreInsertOptions,
  type StoreReadOptions,
  type StoreUpdateOptions,
  type ValueStoreDriver,
} from "@fabric/core";
import Sqlite3, { type Database, type Statement } from "better-sqlite3";
import { filterToParams, filterToSQL } from "./utils/filter-to-sql.js";
import { identifierToSQL } from "./utils/identifier-to-sql.js";
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

  max(model: Model, query: StoreReadOptions): Effect<number, StoreQueryError> {
    const [sql, params] = this.getMaxStatement(model, query);
    return Effect.tryFrom(
      () => {
        const result = this.allPrepared(sql, params);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-non-null-assertion
        const value = result[0][`MAX(${identifierToSQL(query.keys![0])})`] as
          | number
          | undefined;

        return value ?? 0;
      },
      (error: Error) => new StoreQueryError(error.message, sql, params),
    );
  }

  count(
    model: Model,
    query: StoreReadOptions,
  ): Effect<number, StoreQueryError> {
    const [sql, params] = this.getCountStatement(model, query);
    return Effect.tryFrom(
      () => {
        const result = this.allPrepared(sql, params);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return result[0]["COUNT(*)"] as number;
      },
      (error: Error) => new StoreQueryError(error.message, sql, params),
    );
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
          const sql = modelToSql(model);
          try {
            this.db.exec(sql);
          } catch (error) {
            throw new StoreQueryError((error as Error).message, sql);
          }
        });
      },
      (error: StoreQueryError) => error,
    );
  }

  get<T>(model: Model, query: StoreReadOptions): Effect<T[], StoreQueryError> {
    const [sql, params] = this.getSelectStatement(model, query);
    return Effect.tryFrom(
      () => {
        return this.allPrepared(sql, params, transformRow(model)) as T[];
      },
      (error: Error) => new StoreQueryError(error.message, sql, params),
    );
  }
  insert(
    model: Model,
    query: StoreInsertOptions,
  ): Effect<void, StoreQueryError> {
    const [sql, params] = insertToSql(model, query);
    return Effect.tryFrom(
      () => {
        this.runPrepared(sql, params);
      },
      (error: Error) => new StoreQueryError(error.message, sql, params),
    );
  }
  update(
    model: Model,
    query: StoreUpdateOptions,
  ): Effect<void, StoreQueryError> {
    const [sql, params] = updateToSql(model, query);
    return Effect.tryFrom(
      () => {
        this.runPrepared(sql, params);
      },
      (error: Error) => new StoreQueryError(error.message, sql, params),
    );
  }
  delete(
    model: Model,
    query: StoreDeleteOptions,
  ): Effect<void, StoreQueryError> {
    const sql = `DELETE FROM ${query.from} ${filterToSQL(query.where)}`;
    const params = filterToParams(model, query.where);
    return Effect.tryFrom(
      () => {
        this.runPrepared(sql, params);
      },
      (error: Error) => new StoreQueryError(error.message, sql, params),
    );
  }

  close(): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        this.db.close();
      },
      (error: Error) =>
        new StoreQueryError(error.message, "[DB CLOSE]", undefined),
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

  private getCountStatement(
    model: Model,
    query: StoreReadOptions,
  ): [string, Record<string, any>] {
    const queryFilter = filterToSQL(query.where);
    const limit = query.limit ? `LIMIT ${query.limit}` : "";
    const offset = query.offset ? `OFFSET ${query.offset}` : "";

    const sql = [
      `SELECT COUNT(*)`,
      `FROM ${query.from}`,
      queryFilter,
      limit,
      offset,
    ].join(" ");

    return [sql, { ...filterToParams(model, query.where) }];
  }

  private getMaxStatement(
    model: Model,
    query: StoreReadOptions,
  ): [string, Record<string, any>] {
    const queryFilter = filterToSQL(query.where);
    const limit = query.limit ? `LIMIT ${query.limit}` : "";
    const offset = query.offset ? `OFFSET ${query.offset}` : "";

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const maxKey = identifierToSQL(query.keys![0]);

    const sql = [
      `SELECT MAX(${maxKey})`,
      `FROM ${query.from}`,
      queryFilter,
      limit,
      offset,
    ].join(" ");

    return [sql, { ...filterToParams(model, query.where) }];
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
