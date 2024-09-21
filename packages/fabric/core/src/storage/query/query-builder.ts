import { ModelSchema } from "../../domain/index.js";
import { ModelToType } from "../../domain/models/types/model-to-type.js";
import { AsyncResult } from "../../result/async-result.js";
import { Keyof } from "../../types/index.js";
import { StoreQueryError } from "../errors/query-error.js";
import { StorageDriver } from "../storage-driver.js";
import { FilterOptions } from "./filter-options.js";
import { OrderByOptions } from "./order-by-options.js";
import {
  QueryDefinition,
  SelectableQuery,
  StoreLimitableQuery,
  StoreQuery,
  StoreSortableQuery,
} from "./query.js";

export class QueryBuilder<
  TModels extends ModelSchema,
  TEntityName extends Keyof<TModels>,
  T = ModelToType<TModels[TEntityName]>,
> implements StoreQuery<T>
{
  constructor(
    private driver: StorageDriver,
    private query: QueryDefinition<TEntityName>,
  ) {}

  where(where: FilterOptions<T>): StoreSortableQuery<T> {
    this.query = {
      ...this.query,
      where,
    };
    return this;
  }

  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T> {
    this.query = {
      ...this.query,
      orderBy: opts,
    };
    return this;
  }

  limit(limit: number, offset?: number | undefined): SelectableQuery<T> {
    this.query = {
      ...this.query,
      limit,
      offset,
    };

    return this;
  }

  select<K extends Keyof<T>>(
    keys?: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError> {
    return this.driver.select({
      ...this.query,
      keys,
    });
  }

  selectOne<K extends Keyof<T>>(
    keys?: K[],
  ): AsyncResult<Pick<T, K>, StoreQueryError> {
    return this.driver.selectOne({
      ...this.query,
      keys,
    });
  }
}
