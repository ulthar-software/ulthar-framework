import { Effect } from "@fabric/core";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { FilterOptions } from "../filter-options.ts";
import { StoreDeleteOptions } from "../query-options.ts";
import { StoreDeleteQuery } from "./delete-query.ts";

export class StoreDeleteQueryBuilder<T> implements StoreDeleteQuery<T> {
  private readonly query: StoreDeleteOptions;
  constructor(private readonly driver: ValueStoreDriver, from: string) {
    this.query = { from };
  }
  where(filter: FilterOptions<T>): Effect<void, StoreQueryError> {
    return this.driver.delete({
      ...this.query,
      where: filter,
    });
  }
}
