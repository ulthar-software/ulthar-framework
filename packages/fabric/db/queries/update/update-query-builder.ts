import type { Effect, UUID } from "@fabric/core";
import type { Model } from "@fabric/models";
import type { StoreQueryError } from "../../errors/store-query-error.ts";
import type { ValueStoreDriver } from "../../value-store-driver.ts";
import type { FilterOptions } from "../filter-options.ts";
import type { StoreUpdateOptions } from "../query-options.ts";
import type { SettableUpdateQuery, StoreUpdateQuery } from "./update-query.ts";

export class StoreUpdateQueryBuilder<T> implements StoreUpdateQuery<T> {
  constructor(
    private readonly driver: ValueStoreDriver,
    private readonly model: Model,
    private readonly query: StoreUpdateOptions,
  ) {}
  oneById(id: UUID): SettableUpdateQuery<T> {
    return new StoreUpdateQueryBuilder(this.driver, this.model, {
      ...this.query,
      where: {
        id,
      },
    });
  }

  where(filter: FilterOptions): SettableUpdateQuery<T> {
    return new StoreUpdateQueryBuilder(this.driver, this.model, {
      ...this.query,
      where: filter,
    });
  }

  set(value: Partial<T>): Effect<void, StoreQueryError> {
    return this.driver.update(this.model, {
      ...this.query,
      set: value,
    });
  }
}
