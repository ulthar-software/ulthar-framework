import { Effect } from "@fabric/core";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { FilterOptions } from "../filter-options.ts";

export interface StoreDeleteQuery<T> {
  manyWhere(filter: FilterOptions<T>): Effect<void, StoreQueryError>;
  oneById(id: string): Effect<void, StoreQueryError>;
  all(): Effect<void, StoreQueryError>;
}
