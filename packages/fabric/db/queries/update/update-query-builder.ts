import { Effect, UUID } from "@fabric/core";
import { Model } from "@fabric/models";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { FilterOptions } from "../filter-options.ts";
import { StoreUpdateOptions } from "../query-options.ts";
import { SettableUpdateQuery, StoreUpdateQuery } from "./update-query.ts";

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
