import {
  ModelDefinition,
  ModelFromName,
  ModelName,
} from "../../domain/models/create-model.js";
import { ModelToType } from "../../domain/models/model-to-type.js";
import { AsyncResult } from "../../result/async-result.js";
import { Keyof } from "../../types/index.js";
import { QueryError, StorageDriver } from "../driver.js";
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
  TModels extends ModelDefinition,
  TEntityName extends ModelName<TModels>,
  T = ModelToType<ModelFromName<TModels, TEntityName>>,
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
  ): AsyncResult<Pick<T, K>[], QueryError> {
    return this.driver.select({
      ...this.query,
      keys,
    });
  }

  selectOne<K extends Keyof<T>>(
    keys?: K[],
  ): AsyncResult<Pick<T, K>, QueryError> {
    return this.driver.selectOne({
      ...this.query,
      keys,
    });
  }
}