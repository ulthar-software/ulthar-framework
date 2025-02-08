import type { Effect } from "@fabric/core";
import type { StoreQueryError } from "../../errors/store-query-error.ts";
import type { FilterOptions } from "../filter-options.ts";

export interface StoreDeleteQuery<T> {
  manyWhere(filter: FilterOptions<T>): Effect<void, StoreQueryError>;
  oneById(id: string): Effect<void, StoreQueryError>;
  all(): Effect<void, StoreQueryError>;
}
