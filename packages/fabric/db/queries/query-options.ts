// deno-lint-ignore-file no-explicit-any
import { FilterOptions } from "./filter-options.ts";
import { OrderByOptions } from "./order-by-options.ts";

export interface StoreReadOptions {
  from: string;
  where?: FilterOptions;
  orderBy?: OrderByOptions;
  limit?: number;
  offset?: number;
  keys?: string[];
}

export interface StoreInsertOptions {
  into: string;
  values: Record<string, any>[];
}

export interface StoreUpdateOptions {
  table: string;
  where?: FilterOptions;
  set?: any;
}

export interface StoreDeleteOptions {
  from: string;
  where?: FilterOptions;
}
