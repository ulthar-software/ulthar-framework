import { Effect } from "@fabric/core";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { FilterOptions } from "../filter-options.ts";
import { StoreUpdateOptions } from "../query-options.ts";
import { SettableUpdateQuery, StoreUpdateQuery } from "./update-query.ts";

export class StoreUpdateQueryBuilder<T> implements StoreUpdateQuery<T> {
  constructor(
    private readonly driver: ValueStoreDriver,
    private readonly query: StoreUpdateOptions,
  ) {}

  where(filter: FilterOptions): SettableUpdateQuery<T> {
    return new StoreUpdateQueryBuilder(this.driver, {
      ...this.query,
      where: filter,
    });
  }

  set(value: Partial<T>): Effect<void, StoreQueryError> {
    return this.driver.update({
      ...this.query,
      set: value,
    });
  }

  setMany(values: Partial<T>[]): Effect<void, StoreQueryError> {
    return this.driver.update({
      ...this.query,
      set: values,
    });
  }
}
