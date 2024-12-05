import { Effect, type Keyof, type Option } from "@fabric/core";
import {
  AlreadyExistsError,
  NotFoundError,
  StoreQueryError,
} from "../../errors/index.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import type { FilterOptions } from "../filter-options.ts";
import { OrderByOptions } from "../order-by-options.ts";

export interface StoreReadQueryDeps {
  store: ValueStoreDriver;
}

export interface StoreReadQuery<T> extends SortableStoreQuery<T> {
  where(where: FilterOptions<T>): SortableStoreQuery<T>;
}

export interface SortableStoreQuery<T> extends LimitableStoreQuery<T> {
  orderBy(opts: OrderByOptions<T>): LimitableStoreQuery<T>;
}

export interface LimitableStoreQuery<T> extends SelectableStoreQuery<T> {
  limit(limit: number, offset?: number): SelectableStoreQuery<T>;
}

export interface SelectableStoreQuery<T> {
  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;

  selectOne(): Effect<Option<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Option<Pick<T, K>>, StoreQueryError>;

  selectOneOrFail(): Effect<
    T,
    StoreQueryError | NotFoundError
  >;
  selectOneOrFail<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;

  assertNone(): Effect<
    void,
    StoreQueryError | AlreadyExistsError
  >;
}
