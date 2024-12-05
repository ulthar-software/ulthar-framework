import { Effect, Option } from "@fabric/core";
import { StoreQueryError } from "./errors/store-query-error.ts";
import {
  StoreDeleteOptions,
  StoreInsertOptions,
  StoreReadOptions,
  StoreUpdateOptions,
} from "./queries/query-options.ts";

export interface ValueStoreDriver {
  getOne<T>(
    query: StoreReadOptions,
  ): Effect<Option<T>, StoreQueryError>;
  getMany<T>(query: StoreReadOptions): Effect<T[], StoreQueryError>;

  insert(
    query: StoreInsertOptions,
  ): Effect<void, StoreQueryError>;

  update(
    query: StoreUpdateOptions,
  ): Effect<void, StoreQueryError>;

  delete(
    query: StoreDeleteOptions,
  ): Effect<void, StoreQueryError>;
}
