import { Effect, UUID } from "@fabric/core";
import { Model } from "@fabric/models";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { FilterOptions } from "../filter-options.ts";
import { StoreDeleteOptions } from "../query-options.ts";
import { StoreDeleteQuery } from "./delete-query.ts";

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
