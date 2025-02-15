/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect } from "../../effect/effect.js";
import { exhaustiveCheck } from "../../utils/exhaustive-check.js";
import type { CircularDependencyError } from "../../utils/sort-by-dependencies.js";
import type { Model } from "../models/model.js";
import type { StoreQueryError } from "./errors/store-query-error.js";
import type {
  ComparisonFilterOption,
  FilterValue,
  LikeFilterOption,
  SingleFilterOption,
  SpecialFilterOption,
} from "./queries/filter-options.js";
import {
  FILTER_OPTION_OPERATOR_KEY,
  FILTER_OPTION_TYPE_KEY,
  FILTER_OPTION_VALUE_KEY,
  isMultiFilter,
  isSpecialFilterOption,
  type FilterOptions,
} from "./queries/filter-options.js";
import type { OrderByOptions } from "./queries/order-by-options.js";
import type {
  StoreDeleteOptions,
  StoreInsertOptions,
  StoreReadOptions,
  StoreUpdateOptions,
} from "./queries/query-options.js";
import type { ValueStoreDriver } from "./value-store-driver.js";

export class ValueStoreDriverMock implements ValueStoreDriver {
  private data: Record<string, any[]> = {};

  get<T>(model: Model, query: StoreReadOptions): Effect<T[], StoreQueryError> {
    return Effect.from(() => {
      const data = this.data[query.from];
      return onlyKeys(
        limit(
          sort(filter(data, query.where), query.orderBy),
          query.limit,
          query.offset,
        ),
        query.keys,
      ) as T[];
    });
  }
  insert(
    model: Model,
    query: StoreInsertOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.from(() => {
      const data = this.data[model.name];
      data.push(...query.values);
    });
  }
  update(
    model: Model,
    query: StoreUpdateOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.from(() => {
      const data = this.data[model.name];
      const filteredData = filter(data, query.where);
      filteredData.forEach((item) => {
        Object.assign(item, query.set);
      });
    });
  }
  delete(
    model: Model,
    query: StoreDeleteOptions,
  ): Effect<void, StoreQueryError> {
    return Effect.from(() => {
      const data = this.data[model.name];
      const filteredData = filter(data, query.where);
      filteredData.forEach((item) => {
        data.splice(data.indexOf(item), 1);
      });
    });
  }
  close(): Effect<void, StoreQueryError> {
    return Effect.from(() => void 0);
  }
  sync(
    models: Model[],
  ): Effect<void, CircularDependencyError | StoreQueryError> {
    return Effect.from(() => {
      this.data = models.reduce<Record<string, any[]>>((acc, model) => {
        acc[model.name] = [];
        return acc;
      }, {});
    });
  }
}

function limit<T>(data: T[], limit?: number, offset?: number): T[] {
  if (!limit) {
    return data;
  }

  return data.slice(offset ?? 0, offset ? offset + limit : limit);
}

function onlyKeys(data: any[], keys?: string[]): any[] {
  if (!keys) {
    return data;
  }

  return data.map((item) =>
    keys.reduce((acc, key) => {
      //@ts-expect-error - TS doesn't know that item[key] exists
      acc[key] = item[key];
      return acc;
    }, {}),
  );
}

function sort(data: any[], sort?: OrderByOptions): any[] {
  if (!sort) {
    return data;
  }

  const sortEntries = Object.entries(sort);

  return data.sort((a, b) => {
    for (const [key, order] of sortEntries) {
      if (a[key] < b[key]) {
        return order === "ASC" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return order === "ASC" ? 1 : -1;
      }
    }
    return 0;
  });
}

function filter<T>(data: T[], filter?: FilterOptions): T[] {
  if (!filter) {
    return data;
  }

  if (isMultiFilter(filter)) {
    return data.filter((item) =>
      filter.some((filter) => filterItem(item, filter)),
    );
  } else {
    return data.filter((item) => filterItem(item, filter));
  }
}

function filterItem(item: any, filter: SingleFilterOption): boolean {
  return Object.entries(filter).every(([key, value]) => {
    if (typeof value === "object") {
      return filterValue(item[key], value);
    }
    return item[key] === value;
  });
}
function filterValue<T>(value: T, filter: FilterValue<T>): boolean {
  if (isSpecialFilterOption(filter)) {
    return filterBySpecialFilter(value, filter as any);
  } else {
    return value === filter;
  }
}

function filterBySpecialFilter<T>(
  value: T,
  filter: SpecialFilterOption<T>,
): boolean {
  switch (filter[FILTER_OPTION_TYPE_KEY]) {
    case "like":
      return typeof value === "string" && filterLike(value, filter);
    case "in":
      return filter[FILTER_OPTION_VALUE_KEY].includes(value);
    case "comparison":
      return filterComparison(value, filter);
    default:
      return exhaustiveCheck(filter[FILTER_OPTION_TYPE_KEY]);
  }
}

function filterLike(value: string, filter: LikeFilterOption<string>): boolean {
  const likeRegex = new RegExp(
    filter[FILTER_OPTION_VALUE_KEY].split("")
      .map((char) => {
        if (char === "%") {
          return ".*";
        }
        if (char === "_") {
          return ".";
        }
      })
      .join(""),
  );
  return likeRegex.test(value);
}

function filterComparison<T>(
  value: T,
  filter: ComparisonFilterOption<T>,
): boolean {
  switch (filter[FILTER_OPTION_OPERATOR_KEY]) {
    case "<":
      return value < filter[FILTER_OPTION_VALUE_KEY];
    case ">":
      return value > filter[FILTER_OPTION_VALUE_KEY];
    case "<=":
      return value <= filter[FILTER_OPTION_VALUE_KEY];
    case ">=":
      return value >= filter[FILTER_OPTION_VALUE_KEY];
    case "<>":
      return value !== filter[FILTER_OPTION_VALUE_KEY];
    default:
      return exhaustiveCheck(filter[FILTER_OPTION_OPERATOR_KEY]);
  }
}
