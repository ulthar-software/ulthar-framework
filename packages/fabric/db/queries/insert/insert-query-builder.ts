import type { Effect } from "@fabric/core";
import type { Model } from "@fabric/models";
import type { StoreQueryError } from "../../errors/store-query-error.ts";
import type { ValueStoreDriver } from "../../value-store-driver.ts";
import type { StoreInsertOptions } from "../query-options.ts";
import type { StoreInsertQuery } from "./insert-query.ts";

// deno-lint-ignore no-explicit-any
export class StoreInsertQueryBuilder<T extends Record<string, any>>
  implements StoreInsertQuery<T> {
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
