import type { Effect } from "../../../../effect/effect.js";
import type { StoreQueryError } from "../../errors/store-query-error.js";

export interface StoreInsertQuery<T> {
  value(value: T): Effect<void, StoreQueryError>;

  manyValues(values: T[]): Effect<void, StoreQueryError>;
}
