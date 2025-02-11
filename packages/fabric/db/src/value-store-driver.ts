import type { CircularDependencyError } from "@fabric/algorithms/sort-by-dependencies";
import type { Effect } from "@fabric/core";
import type { Model } from "@fabric/models";
import type { StoreQueryError } from "./errors/store-query-error.js";
import type {
  StoreDeleteOptions,
  StoreInsertOptions,
  StoreReadOptions,
  StoreUpdateOptions,
} from "./queries/query-options.js";

export interface ValueStoreDriver {
  get<T>(model: Model, query: StoreReadOptions): Effect<T[], StoreQueryError>;

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
