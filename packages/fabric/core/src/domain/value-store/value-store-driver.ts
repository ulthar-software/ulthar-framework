import type { Effect } from "../../effect/effect.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import type { Model } from "../models/model.js";
import type { StoreQueryError } from "./errors/store-query-error.js";
import type {
  StoreDeleteOptions,
  StoreInsertOptions,
  StoreReadOptions,
  StoreUpdateOptions,
} from "./queries/query-options.js";

export interface ValueStoreDriver {
  count(model: Model, query: StoreReadOptions): Effect<number, StoreQueryError>;

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
