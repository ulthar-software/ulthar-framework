import { Effect } from "@fabric/core";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { StoreInsertOptions } from "../query-options.ts";
import { StoreInsertQuery } from "./insert-query.ts";

export class StoreInsertQueryBuilder<T> implements StoreInsertQuery<T> {
  private readonly query: StoreInsertOptions;
  constructor(private readonly driver: ValueStoreDriver, into: string) {
    this.query = { into } as StoreInsertOptions;
  }
  value(value: T): Effect<void, StoreQueryError> {
    return this.driver.insert({
      ...this.query,
      values: [value],
    });
  }
  manyValues(values: T[]): Effect<void, StoreQueryError> {
    return this.driver.insert({
      ...this.query,
      values,
    });
  }
}
