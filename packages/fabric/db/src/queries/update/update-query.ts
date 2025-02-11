import type { Effect, UUID } from "@fabric/core";
import type { StoreQueryError } from "../../errors/store-query-error.js";
import type { FilterOptions } from "../filter-options.js";

export interface StoreUpdateQuery<T> extends SettableUpdateQuery<T> {
  where(filter: FilterOptions): SettableUpdateQuery<T>;

  oneById(id: UUID): SettableUpdateQuery<T>;
}

export interface SettableUpdateQuery<T> {
  set(value: Partial<T>): Effect<void, StoreQueryError>;
}
