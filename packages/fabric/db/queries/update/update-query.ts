import { Effect } from "@fabric/core";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { FilterOptions } from "../filter-options.ts";

export interface StoreUpdateQuery<T> extends SettableUpdateQuery<T> {
  where(filter: FilterOptions): SettableUpdateQuery<T>;
}

export interface SettableUpdateQuery<T> {
  set(value: Partial<T>): Effect<void, StoreQueryError>;

  setMany(values: Partial<T>[]): Effect<void, StoreQueryError>;
}
