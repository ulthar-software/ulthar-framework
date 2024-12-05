// deno-lint-ignore-file no-explicit-any
import { Effect, Keyof, Option, Result } from "@fabric/core";
import {
  AlreadyExistsError,
  NotFoundError,
  StoreQueryError,
} from "../../errors/index.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { FilterOptions } from "../filter-options.ts";
import { OrderByOptions } from "../order-by-options.ts";
import { StoreReadOptions } from "../query-options.ts";
import {
  LimitableStoreQuery,
  SelectableStoreQuery,
  SortableStoreQuery,
  StoreReadQuery,
} from "./read-query.ts";

export class StoreReadQueryBuilder<T> implements StoreReadQuery<T> {
  constructor(
    private readonly driver: ValueStoreDriver,
    private query: StoreReadOptions,
  ) {}

  where(where: FilterOptions<T>): SortableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, {
      ...this.query,
      where,
    });
  }

  orderBy(opts: OrderByOptions<T>): LimitableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, {
      ...this.query,
      orderBy: opts,
    });
  }

  limit(limit: number, offset?: number): SelectableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, {
      ...this.query,
      limit,
      offset: offset ?? 0,
    });
  }

  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;
  select<K extends Keyof<T>>(
    keys?: K[],
  ): Effect<any, StoreQueryError> {
    return this.driver.getMany<any>({
      ...this.query,
      keys: keys!,
    });
  }

  selectOne(): Effect<Option<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Option<Pick<T, K>>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys?: K[],
  ): Effect<any, StoreQueryError> {
    return this.driver.getOne<any>({
      ...this.query,
      keys: keys!,
    });
  }

  selectOneOrFail(): Effect<
    T,
    StoreQueryError | NotFoundError
  >;
  selectOneOrFail<K extends Extract<keyof T, string>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Extract<keyof T, string>>(
    keys?: K[],
  ): Effect<any, StoreQueryError | NotFoundError> {
    return this.driver.getOne<any>({
      ...this.query,
      keys: keys!,
    }).flatMapResult((v) =>
      v.match({
        some: (value) => Result.ok(value),
        none: () => Result.failWith(new NotFoundError()),
      })
    );
  }

  assertNone(): Effect<
    void,
    StoreQueryError | AlreadyExistsError
  > {
    return this.driver.getOne<any>(this.query).flatMapResult((v) =>
      v.match({
        some: () => Result.failWith(new AlreadyExistsError()),
        none: () => Result.ok(),
      })
    );
  }
}
