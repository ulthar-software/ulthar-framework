/* eslint-disable @typescript-eslint/no-explicit-any */

import { AsyncResult, UnexpectedError } from "@fabric/core";
import { CircularDependencyError } from "../errors/circular-dependency-error.js";
import { StoreQueryError } from "../errors/query-error.js";
import { ModelSchema } from "../models/model-schema.js";
import { QueryDefinition } from "../models/query/query.js";

export interface StorageDriver {
  /**
   * Insert data into the store
   */
  insert(
    collectionName: string,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError>;

  /**
   * Run a select query against the store.
   */
  select(query: QueryDefinition): AsyncResult<any[], StoreQueryError>;

  /**
   * Run a select query against the store.
   */
  selectOne(query: QueryDefinition): AsyncResult<any, StoreQueryError>;

  /**
   * Sincronice the store with the schema.
   */
  sync(
    schema: ModelSchema,
  ): AsyncResult<void, StoreQueryError | CircularDependencyError>;

  /**
   * Drop the store. This is a destructive operation.
   */
  drop(): AsyncResult<void, StoreQueryError>;

  /**
   * Close the store.
   */
  close(): AsyncResult<void, UnexpectedError>;

  /**
   * Update a record in the store.
   */
  update(
    collectionName: string,
    id: string,
    record: Record<string, any>,
  ): AsyncResult<void, StoreQueryError>;

  /**
   * Delete a record from the store.
   */
  delete(
    collectionName: string,
    id: string,
  ): AsyncResult<void, StoreQueryError>;
}
