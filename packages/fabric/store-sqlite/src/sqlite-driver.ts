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
import { SQLiteDatabase } from "./sqlite/sqlite-wrapper.js";

export class SQLiteStorageDriver implements StorageDriver {
  private db: SQLiteDatabase;

  constructor(private path: string) {
    this.db = new SQLiteDatabase(path);
  }

  private getSelectStatement(
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

  /**
   * Insert data into the store
   */
  async insert(
    model: Model,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        await this.db.runPrepared(
          `INSERT INTO ${model.name} (${recordToSQLKeys(record)}) VALUES (${recordToSQLKeyParams(record)})`,
          recordToSQLParams(model, record),
        );
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
        const [sql, params] = this.getSelectStatement(
          schema[query.from],
          query,
        );
        return this.db.allPrepared(
          sql,
          params,
          transformRow(schema[query.from]),
        );
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
        const [stmt, params] = this.getSelectStatement(
          schema[query.from],
          query,
        );
        return await this.db.onePrepared(
          stmt,
          params,
          transformRow(schema[query.from]),
        );
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
        await this.db.withTransaction(async () => {
          for (const modelKey in schema) {
            const model = schema[modelKey];
            await this.db.runPrepared(modelToSql(model));
          }
        });
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
      this.db.close();
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
        const params = recordToSQLParams(model, {
          ...record,
          id,
        });
        await this.db.runPrepared(
          `UPDATE ${model.name} SET ${recordToSQLSet(record)} WHERE id = ${keyToParam("id")}`,
          params,
        );
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
        await this.db.runPrepared(
          `DELETE FROM ${model.name} WHERE id = ${keyToParam("id")}`,
          { $id: id },
        );
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
