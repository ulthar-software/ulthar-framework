import type { Effect } from "@fabric/core";
import type { StoreQueryError } from "../../errors/store-query-error.ts";

export interface StoreInsertQuery<T> {
  value(value: T): Effect<void, StoreQueryError>;

  manyValues(values: T[]): Effect<void, StoreQueryError>;
}
