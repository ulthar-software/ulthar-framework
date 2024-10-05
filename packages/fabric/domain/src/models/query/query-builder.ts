import { AsyncResult, Keyof } from "@fabric/core";
import { StoreQueryError } from "../../errors/query-error.js";
import { StorageDriver } from "../../storage/storage-driver.js";
import { ModelSchema } from "../model-schema.js";
import { FilterOptions } from "./filter-options.js";
import { OrderByOptions } from "./order-by-options.js";
import {
  QueryDefinition,
  SelectableQuery,
  StoreLimitableQuery,
  StoreQuery,
  StoreSortableQuery,
} from "./query.js";

export class QueryBuilder<T> implements StoreQuery<T> {
  constructor(
    private driver: StorageDriver,
    private schema: ModelSchema,
    private query: QueryDefinition,
  ) {}

  where(where: FilterOptions<T>): StoreSortableQuery<T> {
    return new QueryBuilder(this.driver, this.schema, {
      ...this.query,
      where,
    });
  }

  orderBy(opts: OrderByOptions<T>): StoreLimitableQuery<T> {
    return new QueryBuilder(this.driver, this.schema, {
      ...this.query,
      orderBy: opts,
    });
  }

  limit(limit: number, offset?: number | undefined): SelectableQuery<T> {
    return new QueryBuilder(this.driver, this.schema, {
      ...this.query,
      limit,
      offset,
    });
  }

  select<K extends Keyof<T>>(
    keys?: K[],
  ): AsyncResult<Pick<T, K>[], StoreQueryError> {
    return this.driver.select(this.schema[this.query.from], {
      ...this.query,
      keys,
    });
  }

  selectOne<K extends Keyof<T>>(
    keys?: K[],
  ): AsyncResult<Pick<T, K>, StoreQueryError> {
    return this.driver.selectOne(this.schema[this.query.from], {
      ...this.query,
      keys,
    });
  }
}
