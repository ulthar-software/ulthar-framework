/* eslint-disable @typescript-eslint/no-explicit-any */

import type { StoreJoinOptions } from "@fabric/core";
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
        const result = this.allPrepared(sql, ["x"], params);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const value = result[0].x as number | undefined;

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
        const result = this.allPrepared(sql, ["x"], params);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const value = result[0].x as number | undefined;

        return value ?? 0;
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
    const [sql, params, columns] = this.getSelectStatement(model, query);
    return Effect.tryFrom(
      () => {
        return this.allPrepared(
          sql,
          columns,
          params,
          transformRow(model, query),
        ) as T[];
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
    columns: string[],
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ): any[] {
    const cachedStmt = this.getCachedStatement(sql);

    cachedStmt.raw(true);

    const result = cachedStmt.all(params);

    const parsedColumns = columns.map((col) => col.replaceAll(/`/g, ""));

    return result.map((resultRow): any => {
      const parsedRow: Record<string, any> = {};
      for (let i = 0; i < parsedColumns.length; i++) {
        const columnName = parsedColumns[i];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsedRow[columnName] = (resultRow as any[])[i];
      }
      if (transformer) {
        return transformer(parsedRow);
      } else {
        return parsedRow;
      }
    });
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
      `SELECT COUNT(*) as x`,
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
      `SELECT MAX(${maxKey}) as x`,
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
  ): [string, Record<string, any>, string[]] {
    const columns = query.keys
      ? transformManualKeys(model, query.keys)
      : getKeysFromModel(model, query.joins ?? []);

    const selectFields = columns.join(", ");

    const queryFilter = filterToSQL(query.where);
    const limit = query.limit ? `LIMIT ${query.limit}` : "";
    const offset = query.offset ? `OFFSET ${query.offset}` : "";

    // Handle joins if they exist
    const joinClauses = [];
    if (query.joins && query.joins.length > 0) {
      for (const join of query.joins) {
        const joinType = join.type === "left" ? "LEFT JOIN" : "INNER JOIN";
        joinClauses.push(
          `${joinType} ${join.model.name} ${join.as} ON ${join.on.left} = ${join.as}.${join.on.right}`,
        );
      }
    }
    const joinSql = joinClauses.length > 0 ? joinClauses.join(" ") : "";

    const sql = [
      `SELECT ${selectFields}`,
      `FROM ${query.from}`,
      joinSql,
      queryFilter,
      limit,
      offset,
    ]
      .filter((x) => x)
      .join(" ");

    return [
      sql,
      {
        ...filterToParams(model, query.where),
      },
      columns,
    ];
  }
}

function getKeysFromModel(model: Model, joins: StoreJoinOptions[]): string[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const keys = Object.keys(model.fields).map(
    (key) => `${identifierToSQL(model.name)}.${identifierToSQL(key)}`,
  );
  for (const join of joins) {
    const joinModel = join.model;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const joinKeys = Object.keys(joinModel.fields).map(
      (key) => `${identifierToSQL(join.as)}.${identifierToSQL(key)}`,
    );
    keys.push(...joinKeys);
  }
  return keys;
}

function transformManualKeys(model: Model, keys: string[]): string[] {
  const transformedKeys = keys.map((key) => {
    const parts = key.split(".");
    if (parts.length === 1) {
      return `${identifierToSQL(model.name)}.${identifierToSQL(parts[0])}`;
    } else if (parts.length === 2) {
      return `${identifierToSQL(parts[0])}.${identifierToSQL(parts[1])}`;
    } else {
      throw new Error(`Invalid key format: ${key}`);
    }
  });
  return transformedKeys;
}
