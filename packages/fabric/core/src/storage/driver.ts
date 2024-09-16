/* eslint-disable @typescript-eslint/no-explicit-any */

import { ModelDefinition } from "../domain/models/create-model.js";
import { TaggedError } from "../error/tagged-error.js";
import { AsyncResult } from "../result/async-result.js";
import { QueryDefinition } from "./query/query.js";
import { CircularDependencyError } from "./utils/sort-by-dependencies.js";

export interface StorageDriver {
  /**
   * Insert data into the store
   */
  insert(collectionName: string, record: any): AsyncResult<void, QueryError>;

  /**
   * Run a select query against the store.
   */
  select(query: QueryDefinition): AsyncResult<any[], QueryError>;

  /**
   * Run a select query against the store.
   */
  selectOne(query: QueryDefinition): AsyncResult<any, QueryError>;

  /**
   * Sincronice the store with the schema.
   */
  sync(
    schema: ModelDefinition[],
  ): AsyncResult<void, QueryError | CircularDependencyError>;

  /**
   * Drop the store. This is a destructive operation.
   */
  drop(): AsyncResult<void, QueryError>;

  /**
   * Update a record in the store.
   */
  update(
    collectionName: string,
    id: string,
    record: Record<string, any>,
  ): AsyncResult<void, QueryError>;
}

export class QueryError extends TaggedError<"QueryError"> {
  constructor(
    public message: string,
    public context: any,
  ) {
    super("QueryError");
  }
}
