import type { Effect } from "../../../../effect/effect.js";
import type { UUID } from "../../../../types/uuid.js";
import type { StoreQueryError } from "../../errors/store-query-error.js";
import type { FilterOptions } from "../filter-options.js";

export interface StoreUpdateQuery<T> extends SettableUpdateQuery<T> {
  where(filter: FilterOptions): SettableUpdateQuery<T>;

  oneById(id: UUID): SettableUpdateQuery<T>;
}

export interface SettableUpdateQuery<T> {
  set(value: Partial<T>): Effect<void, StoreQueryError>;
}
