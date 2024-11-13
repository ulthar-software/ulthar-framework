// deno-lint-ignore-file no-explicit-any
import { Effect, type Keyof, type Optional, TaggedError } from "@fabric/core";
import type { StoreQueryError } from "../../errors/query-error.ts";
import type { FilterOptions } from "./filter-options.ts";
import type { OrderByOptions } from "./order-by-options.ts";

export interface StoreQuery<T> {
  where(where: FilterOptions<T>): StoreSortableQuery<T>;
  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T>;
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;

  selectOne(): Effect<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Optional<Pick<T, K>>, StoreQueryError>;

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError>;
}

export interface StoreSortableQuery<T> {
  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T>;
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;

  selectOne(): Effect<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Optional<Pick<T, K>>, StoreQueryError>;

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError>;
}

export interface StoreLimitableQuery<T> {
  limit(limit: number, offset?: number): SelectableQuery<T>;

  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;

  selectOne(): Effect<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Optional<Pick<T, K>>, StoreQueryError>;

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError>;
}

export interface SelectableQuery<T> {
  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;

  selectOne(): Effect<Optional<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Optional<Pick<T, K>>, StoreQueryError>;

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError>;
}

export interface StoreQueryDefinition<K extends string = string> {
  from: K;
  where?: FilterOptions<any>;
  orderBy?: OrderByOptions<any>;
  limit?: number;
  offset?: number;
  keys?: string[];
}

export class NotFoundError extends TaggedError<"NotFoundError"> {
  constructor() {
    super("NotFoundError");
  }
}

export class AlreadyExistsError extends TaggedError<"AlreadyExistsError"> {
  constructor() {
    super("AlreadyExistsError");
  }
}
