/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncResult } from "../../result/async-result.js";
import { Keyof } from "../../types/keyof.js";
import { QueryError } from "../driver.js";
import { FilterOptions } from "./filter-options.js";
import { OrderByOptions } from "./order-by-options.js";

export interface StoreQuery<T> {
  where(where: FilterOptions<T>): StoreSortableQuery<T>;
  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T>;
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): AsyncResult<T[], QueryError>;
  select<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>[], QueryError>;

  selectOne(): AsyncResult<T, QueryError>;
  selectOne<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>, QueryError>;
}

export interface StoreSortableQuery<T> {
  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T>;
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): AsyncResult<T[], QueryError>;
  select<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>[], QueryError>;

  selectOne(): AsyncResult<T, QueryError>;
  selectOne<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>, QueryError>;
}

export interface StoreLimitableQuery<T> {
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): AsyncResult<T[], QueryError>;
  select<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>[], QueryError>;

  selectOne(): AsyncResult<T, QueryError>;
  selectOne<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>, QueryError>;
}

export interface SelectableQuery<T> {
  select(): AsyncResult<T[], QueryError>;
  select<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>[], QueryError>;

  selectOne(): AsyncResult<T, QueryError>;
  selectOne<K extends Keyof<T>>(keys: K[]): AsyncResult<Pick<T, K>, QueryError>;
}

export interface QueryDefinition<K extends string = string> {
  from: K;
  where?: FilterOptions<any>;
  orderBy?: OrderByOptions<any>;
  limit?: number;
  offset?: number;
  keys?: string[];
}
