import type { Effect, UUID } from "@fabric/core";
import type { Model } from "@fabric/models";
import type { StoreQueryError } from "../../errors/store-query-error.ts";
import type { ValueStoreDriver } from "../../value-store-driver.ts";
import type { FilterOptions } from "../filter-options.ts";
import type { StoreDeleteOptions } from "../query-options.ts";
import type { StoreDeleteQuery } from "./delete-query.ts";

export class StoreDeleteQueryBuilder<T> implements StoreDeleteQuery<T> {
  private readonly query: StoreDeleteOptions;
  constructor(
    private readonly driver: ValueStoreDriver,
    private readonly model: Model,
    from: string,
  ) {
    this.query = { from };
  }
  manyWhere(filter: FilterOptions<T>): Effect<void, StoreQueryError> {
    return this.driver.delete(this.model, {
      ...this.query,
      where: filter,
    });
  }
  oneById(id: UUID): Effect<void, StoreQueryError> {
    return this.driver.delete(this.model, {
      ...this.query,
      where: { id },
    });
  }
  all(): Effect<void, StoreQueryError> {
    return this.driver.delete(this.model, this.query);
  }
}
