/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncResult, UnexpectedError } from "@fabric/core";
import { unlink } from "fs/promises";

import {
  CircularDependencyError,
  ModelSchema,
  QueryDefinition,
  StorageDriver,
  StoreQueryError,
} from "@fabric/domain";
import { Database, Statement } from "sqlite3";
import { modelToSql } from "./model-to-sql.js";
import {
  recordToKeys,
  recordToParams,
  recordToSQLSet,
} from "./record-utils.js";
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
    this.db.run("PRAGMA journal_mode= WAL;");
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

  /**
   * Insert data into the store
   */
  async insert(
    collectionName: string,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError> {
    try {
      const sql = `INSERT INTO ${collectionName} (${recordToKeys(record)}) VALUES (${recordToKeys(record, ":")})`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      return await run(stmt, recordToParams(record));
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        collectionName,
        record,
      });
    }
  }

  /**
   * Run a select query against the store.
   */
  async select(query: QueryDefinition): AsyncResult<any[], StoreQueryError> {
    try {
      const sql = `SELECT * FROM ${query.from}`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      return await getAll(stmt);
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
  async selectOne(query: QueryDefinition): AsyncResult<any, StoreQueryError> {
    try {
      const sql = `SELECT * FROM ${query.from}`;
      const stmt = await this.getOrCreatePreparedStatement(sql);

      return await getOne(stmt);
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
    collectionName: string,
    id: string,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError> {
    try {
      const sql = `UPDATE ${collectionName} SET ${recordToSQLSet(record)} WHERE id = :id`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      return await run(
        stmt,
        recordToParams({
          ...record,
          id,
        }),
      );
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        collectionName,
        record,
      });
    }
  }

  /**
   * Delete a record from the store.
   */

  async delete(
    collectionName: string,
    id: string,
  ): AsyncResult<void, StoreQueryError> {
    try {
      const sql = `DELETE FROM ${collectionName} WHERE id = :id`;
      const stmt = await this.getOrCreatePreparedStatement(sql);
      return await run(stmt, { ":id": id });
    } catch (error: any) {
      return new StoreQueryError(error.message, {
        error,
        collectionName,
        id,
      });
    }
  }
}
