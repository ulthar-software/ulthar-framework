// deno-lint-ignore-file no-explicit-any
import type { AsyncResult, Keyof, Optional } from "@fabric/core";
import type { StoreQueryError } from "../../errors/query-error.ts";
import type { FilterOptions } from "./filter-options.ts";
import type { OrderByOptions } from "./order-by-options.ts";

export interface StoreQuery<T> {
  where(where: FilterOptions<T>): StoreSortableQuery<T>;
  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T>;
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): AsyncResult<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError>;

  selectOne(): AsyncResult<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Optional<Pick<T, K>>, StoreQueryError>;
}

export interface StoreSortableQuery<T> {
  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T>;
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): AsyncResult<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError>;

  selectOne(): AsyncResult<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Optional<Pick<T, K>>, StoreQueryError>;
}

export interface StoreLimitableQuery<T> {
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): AsyncResult<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError>;

  selectOne(): AsyncResult<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Optional<Pick<T, K>>, StoreQueryError>;
}

export interface SelectableQuery<T> {
  select(): AsyncResult<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError>;

  selectOne(): AsyncResult<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): AsyncResult<Optional<Pick<T, K>>, StoreQueryError>;
}

export interface QueryDefinition<K extends string = string> {
  from: K;
  where?: FilterOptions<any>;
  orderBy?: OrderByOptions<any>;
  limit?: number;
  offset?: number;
  keys?: string[];
}