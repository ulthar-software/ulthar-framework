import type { Effect } from "@fabric/core";
import type { Model } from "@fabric/models";
import type { StoreQueryError } from "../../errors/store-query-error.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import type { StoreInsertOptions } from "../query-options.js";
import type { StoreInsertQuery } from "./insert-query.js";

export class StoreInsertQueryBuilder<T extends Record<string, any>>
  implements StoreInsertQuery<T>
{
  private readonly query: StoreInsertOptions;
  constructor(
    private readonly driver: ValueStoreDriver,
    private readonly model: Model,
    into: string,
  ) {
    this.query = { into } as StoreInsertOptions;
  }
  value(value: T): Effect<void, StoreQueryError> {
    return this.driver.insert(this.model, {
      ...this.query,
      values: [value],
    });
  }
  manyValues(values: T[]): Effect<void, StoreQueryError> {
    return this.driver.insert(this.model, {
      ...this.query,
      values,
    });
  }
}
