// deno-lint-ignore-file no-explicit-any
import { Effect } from "@fabric/core";
import {
  StoreDeleteOptions,
  StoreInsertOptions,
  StoreQueryError,
  StoreReadOptions,
  StoreUpdateOptions,
  ValueStoreDriver,
} from "@fabric/db";
import { Model } from "@fabric/models";
import {
  CircularDependencyError,
  sortByDependencies,
} from "@fabric/utils/sort-by-dependencies";
import { Database, Statement } from "jsr:@db/sqlite";
import { filterToParams, filterToSQL } from "./utils/filter-to-sql.ts";
import { insertToSQL } from "./utils/insert-to-sql.ts";
import { modelToSql } from "./utils/model-to-sql.ts";
import { transformRow } from "./utils/sql-to-value.ts";
import { updateToSQL } from "./utils/update-to-sql.ts";

export class SQLiteStoreDriver implements ValueStoreDriver {
  db: Database;

  private cachedStatements = new Map<string, Statement>();

  constructor(private readonly path: string) {
    this.db = new Database(path);
    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run("PRAGMA foreign_keys = ON");
  }

  sync(
    models: Model[],
  ): Effect<void, CircularDependencyError | StoreQueryError> {
    return Effect.fromResult(
      () =>
        sortByDependencies(models, {
          keyGetter: (model) => model.name,
          depsGetter: (model) =>
            model.getReferences().map((ref) => ref.targetModel),
        }),
    ).tryMap((sortedModels) => {
      sortedModels.map((model) => {
        this.db.run(modelToSql(model));
      });
    }, (error) => new StoreQueryError(error.message));
  }

  get<T>(
    model: Model,
    query: StoreReadOptions,
  ): Effect<T[], StoreQueryError> {
    return Effect.tryFrom(
      () => {
        const [sql, params] = this.getSelectStatement(model, query);
        return this.allPrepared(
          sql,
          params,
          transformRow(model),
        );
      },
      (error) => new StoreQueryError(error.message),
    );
  }
  insert(
    model: Model,
    query: StoreInsertOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () =>
        this.runPrepared(
          ...insertToSQL(model, query),
        ),
      (error) => new StoreQueryError(error.message),
    );
  }
  update(
    model: Model,
    query: StoreUpdateOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      () => {
        this.runPrepared(
          ...updateToSQL(model, query),
        );
      },
      (error) => new StoreQueryError(error.message),
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
      (error) => new StoreQueryError(error.message),
    );
  }

  close() {
    return Effect.tryFrom(() => {
      this.finalizeStatements();
      this.db.close();
    }, (error) => new StoreQueryError(error.message));
  }

  private runPrepared(sql: string, params?: Record<string, any>) {
    const cachedStmt = this.getCachedStatement(sql);
    cachedStmt.run(params);
  }

  private allPrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ) {
    const cachedStmt = this.getCachedStatement(sql);

    const result = cachedStmt.all(params);

    return transformer ? result.map(transformer) : result;
  }

  private onePrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ) {
    const cachedStmt = this.getCachedStatement(sql);

    const result = cachedStmt.all(params);

    if (result.length === 0) {
      return;
    }

    return transformer ? transformer(result[0]) : result[0];
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

  private finalizeStatements() {
    for (const stmt of this.cachedStatements.values()) {
      stmt.finalize();
    }
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
