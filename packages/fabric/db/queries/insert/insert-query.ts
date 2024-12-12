import { Effect } from "@fabric/core";
import { StoreQueryError } from "../../errors/store-query-error.ts";

export interface StoreInsertQuery<T> {
  value(value: T): Effect<void, StoreQueryError>;

  manyValues(values: T[]): Effect<void, StoreQueryError>;
}
