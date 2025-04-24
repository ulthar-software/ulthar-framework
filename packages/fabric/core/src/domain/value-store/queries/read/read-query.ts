import type { Effect } from "../../../../effect/effect.js";
import type { Option } from "../../../../option/option.js";
import type { Keyof } from "../../../../types/keyof.js";
import type {
  AlreadyExistsError,
  NotFoundError,
  StoreQueryError,
} from "../../errors/index.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import type { FilterOptions } from "../filter-options.js";
import type { OrderByOptions } from "../order-by-options.js";

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
  select<K extends Keyof<T>>(keys: K[]): Effect<Pick<T, K>[], StoreQueryError>;

  count(): Effect<number, StoreQueryError>;
  max(key: Keyof<T>): Effect<number, StoreQueryError>;

  selectOne(): Effect<Option<T>, StoreQueryError>;
  selectOne<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Option<Pick<T, K>>, StoreQueryError>;

  selectOneOrFail(): Effect<T, StoreQueryError | NotFoundError>;
  selectOneOrFail<K extends Keyof<T>>(
    keys: K[],
  ): Effect<Pick<T, K>, StoreQueryError | NotFoundError>;

  assertNone(): Effect<void, StoreQueryError | AlreadyExistsError>;
}
