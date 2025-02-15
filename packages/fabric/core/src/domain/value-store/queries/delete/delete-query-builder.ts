import type { Effect } from "../../../../effect/effect.js";
import type { UUID } from "../../../../types/uuid.js";
import type { Model } from "../../../models/model.js";
import type { StoreQueryError } from "../../errors/store-query-error.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import type { FilterOptions } from "../filter-options.js";
import type { StoreDeleteOptions } from "../query-options.js";
import type { StoreDeleteQuery } from "./delete-query.js";

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
