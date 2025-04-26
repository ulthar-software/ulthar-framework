/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect } from "../../../../effect/effect.js";
import { Option } from "../../../../option/option.js";
import { Result } from "../../../../result/result.js";
import type { Keyof } from "../../../../types/keyof.js";
import type { Model } from "../../../models/model.js";
import {
  AlreadyExistsError,
  NotFoundError,
  type StoreQueryError,
} from "../../errors/index.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import type { FilterOptions } from "../filter-options.js";
import type { OrderByOptions } from "../order-by-options.js";
import type { StoreReadOptions } from "../query-options.js";
import type { JoinedModel, JoinOptions } from "./join-types.js";
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

  selectAndMap<U>(fn: (values: T[]) => U[]): Effect<U[], StoreQueryError>;
  selectAndMap<U, K extends Extract<keyof T, string>>(
    fn: (values: Pick<T, K>[]) => U[],
    keys: K[],
  ): Effect<U[], StoreQueryError>;
  selectAndMap<U>(
    fn: (v: any[]) => U[],
    keys?: string[],
  ): Effect<U[], StoreQueryError> {
    return this.driver
      .get<any>(this.model, {
        ...this.query,
        keys: keys,
      })
      .map((values) => fn(values));
  }

  count(): Effect<number, StoreQueryError> {
    return this.driver.count(this.model, this.query);
  }

  max(key: Keyof<T>): Effect<number, StoreQueryError> {
    return this.driver.max(this.model, {
      ...this.query,
      keys: [key],
    });
  }

  where(where: FilterOptions<T>): SortableStoreQuery<T> {
    return new StoreReadQueryBuilder(this.driver, this.model, {
      ...this.query,
      where,
    });
  }

  leftJoin<TModel extends Model, TAsKey extends string>(
    opts: JoinOptions<TModel, T, TAsKey>,
  ): StoreReadQuery<T & JoinedModel<TModel, TAsKey>> {
    return new StoreReadQueryBuilder(this.driver, this.model, {
      ...this.query,
      joins: [
        ...(this.query.joins ?? []),
        {
          type: "left",
          model: opts.model,
          as: opts.as,
          on: {
            left: opts.on.left,
            right: opts.on.right,
          },
        },
      ],
    }) as StoreReadQuery<T & JoinedModel<TModel, TAsKey>>;
  }

  innerJoin<TModel extends Model, TAsKey extends string>(
    opts: JoinOptions<TModel, T, TAsKey>,
  ): StoreReadQuery<T & JoinedModel<TModel, TAsKey>> {
    return new StoreReadQueryBuilder(this.driver, this.model, {
      ...this.query,
      joins: [
        ...(this.query.joins ?? []),
        {
          type: "inner",
          model: opts.model,
          as: opts.as,
          on: {
            left: opts.on.left,
            right: opts.on.right,
          },
        },
      ],
    }) as StoreReadQuery<T & JoinedModel<TModel, TAsKey>>;
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

  selectDistinct(): Effect<T[], StoreQueryError>;
  selectDistinct<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>[], StoreQueryError>;
  selectDistinct<K extends Keyof<T>>(keys?: K[]): Effect<any, StoreQueryError> {
    return this.driver.get<any>(this.model, {
      ...this.query,
      keys: keys as string[],
      distinct: true,
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
