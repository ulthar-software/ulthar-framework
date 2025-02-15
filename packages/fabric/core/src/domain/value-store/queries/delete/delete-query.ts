import type { Effect } from "../../../../effect/effect.js";
import type { StoreQueryError } from "../../errors/store-query-error.js";
import type { FilterOptions } from "../filter-options.js";

export interface StoreDeleteQuery<T> {
  manyWhere(filter: FilterOptions<T>): Effect<void, StoreQueryError>;
  oneById(id: string): Effect<void, StoreQueryError>;
  all(): Effect<void, StoreQueryError>;
}
