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

    // Enable Write-Ahead Logging, which is faster and more reliable.
    this.db.run("PRAGMA journal_mode = WAL;");
    this.db.run("PRAGMA foreign_keys = ON;");
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
    try {
      const sql = `INSERT INTO ${model.name} (${recordToSQLKeys(record)}) VALUES (${recordToSQLKeyParams(record)})`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      return await run(stmt, recordToSQLParams(model, record));
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        collectionName: model.name,
        record,
      });
    }
  }

  /**
   * Run a select query against the store.
   */
  async select(
    collection: Collection,
    query: QueryDefinition,
  ): AsyncResult<any[], StoreQueryError> {
    try {
      const [stmt, params] = await this.getSelectStatement(collection, query);
      return await getAll(stmt, params, transformRow(collection));
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        query,
      });
    }
  }

  /**
   * Run a select query against the store.
   */
  async selectOne(
    collection: Collection,
    query: QueryDefinition,
  ): AsyncResult<any, StoreQueryError> {
    try {
      const [stmt, params] = await this.getSelectStatement(collection, query);
      return await getOne(stmt, params, transformRow(collection));
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        query,
      });
    }
  }

  /**
   * Sincronice the store with the schema.
   */
  async sync(
    schema: ModelSchema,
  ): AsyncResult<void, StoreQueryError | CircularDependencyError> {
    try {
      await dbRun(this.db, "BEGIN TRANSACTION;");
      for (const modelKey in schema) {
        const model = schema[modelKey];
        await dbRun(this.db, modelToSql(model));
      }
      await dbRun(this.db, "COMMIT;");
    } catch (error: any) {
      await dbRun(this.db, "ROLLBACK;");
      return new StoreQueryError(error.message, {
        error,
        schema,
      });
    }
  }

  /**
   * Drop the store. This is a destructive operation.
   */
  async drop(): AsyncResult<void, StoreQueryError> {
    try {
      if (this.path === ":memory:") {
        return new StoreQueryError("Cannot drop in-memory database", {});
      } else {
        await unlink(this.path);
      }
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
      });
    }
  }

  async close(): AsyncResult<void, UnexpectedError> {
    try {
      for (const stmt of this.cachedStatements.values()) {
        await finalize(stmt);
      }
      await dbClose(this.db);
    } catch (error: any) {
      return new UnexpectedError({ error });
    }
  }

  /**
   * Update a record in the store.
   */
  async update(
    model: Model,
    id: string,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError> {
    try {
      const sql = `UPDATE ${model.name} SET ${recordToSQLSet(record)} WHERE id = ${keyToParam("id")}`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      const params = recordToSQLParams(model, {
        ...record,
        id,
      });
      return await run(stmt, params);
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        collectionName: model.name,
        record,
      });
    }
  }

  /**
   * Delete a record from the store.
   */

  async delete(model: Model, id: string): AsyncResult<void, StoreQueryError> {
    try {
      const sql = `DELETE FROM ${model.name} WHERE id = :id`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      return await run(stmt, { ":id": id });
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        collectionName: model.name,
        id,
      });
    }
  }
}
