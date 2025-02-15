import type { Effect } from "../../../../effect/effect.js";
import type { UUID } from "../../../../types/uuid.js";
import type { Model } from "../../../models/model.js";
import type { StoreQueryError } from "../../errors/store-query-error.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import type { FilterOptions } from "../filter-options.js";
import type { StoreUpdateOptions } from "../query-options.js";
import type { SettableUpdateQuery, StoreUpdateQuery } from "./update-query.js";

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
