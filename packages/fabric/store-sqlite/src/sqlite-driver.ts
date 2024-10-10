/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncResult, UnexpectedError } from "@fabric/core";
import { unlink } from "fs/promises";

import {
  CircularDependencyError,
  Collection,
  Model,
  ModelSchema,
  QueryDefinition,
  StorageDriver,
  StoreQueryError,
} from "@fabric/domain";
import { Database, Statement } from "sqlite3";
import { filterToParams, filterToSQL } from "./filter-to-sql.js";
import { modelToSql } from "./model-to-sql.js";
import {
  keyToParam,
  recordToSQLKeyParams,
  recordToSQLKeys,
  recordToSQLParams,
  recordToSQLSet,
} from "./record-utils.js";
import { transformRow } from "./sql-to-value.js";
import {
  dbClose,
  dbRun,
  finalize,
  getAll,
  getOne,
  prepare,
  run,
} from "./sqlite-wrapper.js";

export class SQLiteStorageDriver implements StorageDriver {
  private db: Database;

  private cachedStatements = new Map<string, Statement>();

  constructor(private path: string) {
    this.db = new Database(path);
  }

  /**
   * Get a statement from the cache or prepare a new one.
   */
  private async getOrCreatePreparedStatement(sql: string): Promise<Statement> {
    if (this.cachedStatements.has(sql)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know it's there.
      return this.cachedStatements.get(sql)!;
    }

    const stmt = await prepare(this.db, sql);
    this.cachedStatements.set(sql, stmt);

    return stmt;
  }

  private async getSelectStatement(
    collection: Collection,
    query: QueryDefinition,
  ): Promise<[Statement, Record<string, any>]> {
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
      await this.getOrCreatePreparedStatement(sql),
      {
        ...filterToParams(collection, query.where),
      },
    ];
  }

  /**
   * Insert data into the store
   */
  async insert(
    model: Model,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const sql = `INSERT INTO ${model.name} (${recordToSQLKeys(record)}) VALUES (${recordToSQLKeyParams(record)})`;
        const stmt = await this.getOrCreatePreparedStatement(sql);
        return await run(stmt, recordToSQLParams(model, record));
      },
      (error) =>
        new StoreQueryError(error.message, {
          error,
          collectionName: model.name,
          record,
        }),
    );
  }

  /**
   * Run a select query against the store.
   */
  async select(
    schema: ModelSchema,
    query: QueryDefinition,
  ): AsyncResult<any[], StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const [stmt, params] = await this.getSelectStatement(
          schema[query.from],
          query,
        );
        return await getAll(stmt, params, transformRow(schema[query.from]));
      },
      (err) =>
        new StoreQueryError(err.message, {
          err,
          query,
        }),
    );
  }

  /**
   * Run a select query against the store.
   */
  async selectOne(
    schema: ModelSchema,
    query: QueryDefinition,
  ): AsyncResult<any, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const [stmt, params] = await this.getSelectStatement(
          schema[query.from],
          query,
        );
        return await getOne(stmt, params, transformRow(schema[query.from]));
      },
      (err) =>
        new StoreQueryError(err.message, {
          err,
          query,
        }),
    );
  }

  /**
   * Sincronice the store with the schema.
   */
  async sync(
    schema: ModelSchema,
  ): AsyncResult<void, StoreQueryError | CircularDependencyError> {
    return AsyncResult.tryFrom(
      async () => {
        // Enable Write-Ahead Logging, which is faster and more reliable.
        await dbRun(this.db, "PRAGMA journal_mode = WAL;");

        // Enable foreign key constraints.
        await dbRun(this.db, "PRAGMA foreign_keys = ON;");

        // Begin a transaction to create the schema.
        await dbRun(this.db, "BEGIN TRANSACTION;");
        for (const modelKey in schema) {
          const model = schema[modelKey];
          await dbRun(this.db, modelToSql(model));
        }
        await dbRun(this.db, "COMMIT;");
      },
      (error) =>
        new StoreQueryError(error.message, {
          error,
          schema,
        }),
    );
  }

  /**
   * Drop the store. This is a destructive operation.
   */
  async drop(): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        if (this.path === ":memory:") {
          throw "Cannot drop in-memory database";
        } else {
          await unlink(this.path);
        }
      },
      (error) =>
        new StoreQueryError(error.message, {
          error,
        }),
    );
  }

  async close(): AsyncResult<void, UnexpectedError> {
    return AsyncResult.from(async () => {
      for (const stmt of this.cachedStatements.values()) {
        await finalize(stmt);
      }
      await dbClose(this.db);
    });
  }

  /**
   * Update a record in the store.
   */
  async update(
    model: Model,
    id: string,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const sql = `UPDATE ${model.name} SET ${recordToSQLSet(record)} WHERE id = ${keyToParam("id")}`;
        const stmt = await this.getOrCreatePreparedStatement(sql);
        const params = recordToSQLParams(model, {
          ...record,
          id,
        });
        return await run(stmt, params);
      },
      (error) =>
        new StoreQueryError(error.message, {
          error,
          collectionName: model.name,
          record,
        }),
    );
  }

  /**
   * Delete a record from the store.
   */

  async delete(model: Model, id: string): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const sql = `DELETE FROM ${model.name} WHERE id = ${keyToParam("id")}`;
        const stmt = await this.getOrCreatePreparedStatement(sql);
        return await run(stmt, { [keyToParam("id")]: id });
      },
      (error) =>
        new StoreQueryError(error.message, {
          error,
          collectionName: model.name,
          id,
        }),
    );
  }
}
