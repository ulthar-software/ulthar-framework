import { type Effect, type Keyof, Option, Result } from "@fabric/core";
import type { Model } from "@fabric/models";
import {
  AlreadyExistsError,
  NotFoundError,
  type StoreQueryError,
} from "../../errors/index.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import type { FilterOptions } from "../filter-options.js";
import type { OrderByOptions } from "../order-by-options.js";
import type { StoreReadOptions } from "../query-options.js";
import type {
  LimitableStoreQuery,
  SelectableStoreQuery,
  SortableStoreQuery,
  StoreReadQuery,
} from "./read-query.js";

export class StoreReadQueryBuilder<T> implements StoreReadQuery<T> {
  constructor(
    private readonly driver: ValueStoreDriver,
    private readonly model: Model,
    private query: StoreReadOptions,
  ) {}

  where(where: FilterOptions<T>): SortableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, this.model, {
      ...this.query,
      where,
    });
  }

  orderBy(opts: OrderByOptions<T>): LimitableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, this.model, {
      ...this.query,
      orderBy: opts,
    });
  }

  limit(limit: number, offset?: number): SelectableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, this.model, {
      ...this.query,
      limit,
      offset: offset ?? 0,
    });
  }

  select(): Effect<T[], StoreQueryError>;
  select<K extends Keyof<T>>(keys: K[]): Effect<Pick<T, K>[], StoreQueryError>;
  select<K extends Keyof<T>>(keys?: K[]): Effect<any, StoreQueryError> {
    return this.driver.get<any>(this.model, {
      ...this.query,
      keys: keys!,
    });
  }

  selectOne(): Effect<Option<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Option<Pick<T, K>>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(keys?: K[]): Effect<any, StoreQueryError> {
    return this.driver
      .get<any>(this.model, {
        ...this.query,
        keys: keys!,
        limit: 1,
      })
      .map((v) => Option.from(v[0]));
  }

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Extract<keyof T, string>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Extract<keyof T, string>>(
    keys?: K[],
  ): Effect<any, StoreQueryError | NotFoundError> {
    return this.selectOne(keys!).mapResult((v) =>
      v.match({
        some: (value) => Result.ok(value),
        none: () => Result.failWith(new NotFoundError()),
      }),
    );
  }

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError> {
    return this.selectOne().mapResult((v) =>
      v.match({
        some: () => Result.failWith(new AlreadyExistsError()),
        none: () => Result.ok(),
      }),
    );
  }
}
