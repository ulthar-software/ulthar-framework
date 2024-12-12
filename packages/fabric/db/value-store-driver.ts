import { Effect } from "@fabric/core";
import { Model } from "@fabric/models";
import { CircularDependencyError } from "@fabric/utils/sort-by-dependencies";
import { StoreQueryError } from "./errors/store-query-error.ts";
import {
  StoreDeleteOptions,
  StoreInsertOptions,
  StoreReadOptions,
  StoreUpdateOptions,
} from "./queries/query-options.ts";

export interface ValueStoreDriver {
  get<T>(
    model: Model,
    query: StoreReadOptions,
  ): Effect<T[], StoreQueryError>;

  insert(
    model: Model,
    query: StoreInsertOptions,
  ): Effect<void, StoreQueryError>;

  update(
    model: Model,
    query: StoreUpdateOptions,
  ): Effect<void, StoreQueryError>;

  delete(
    model: Model,
    query: StoreDeleteOptions,
  ): Effect<void, StoreQueryError>;

  close(): Effect<void, StoreQueryError>;

  sync(
    models: Model[],
  ): Effect<void, CircularDependencyError | StoreQueryError>;
}
