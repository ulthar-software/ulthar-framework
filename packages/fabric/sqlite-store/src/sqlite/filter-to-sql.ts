// deno-lint-ignore-file no-explicit-any
import {
  Collection,
  FieldDefinition,
  FILTER_OPTION_OPERATOR_SYMBOL,
  FILTER_OPTION_TYPE_SYMBOL,
  FILTER_OPTION_VALUE_SYMBOL,
  FilterOptions,
  FilterValue,
  MultiFilterOption,
  SingleFilterOption,
} from "@fabric/domain";
import { keyToParam } from "./record-utils.ts";
import { fieldValueToSQL } from "./value-to-sql.ts";

export function filterToSQL(filterOptions?: FilterOptions) {
  if (!filterOptions) return "";

  if (Array.isArray(filterOptions)) {
    return `WHERE ${getWhereFromMultiOption(filterOptions)}`;
  }

  return `WHERE ${getWhereFromSingleOption(filterOptions)}`;
}

export function filterToParams(
  collection: Collection,
  filterOptions?: FilterOptions,
) {
  if (!filterOptions) return {};

  if (Array.isArray(filterOptions)) {
    return getParamsFromMultiFilterOption(collection, filterOptions);
  }

  return getParamsFromSingleFilterOption(collection, filterOptions);
}

function getWhereFromMultiOption(filterOptions: MultiFilterOption) {
  return filterOptions
    .map(
      (option, i) =>
        `(${getWhereFromSingleOption(option, { postfix: `_${i}` })})`,
    )
    .join(" OR ");
}

function getWhereFromSingleOption(
  filterOptions: SingleFilterOption,
  opts: { postfix?: string } = {},
) {
  return Object.entries(filterOptions)
    .map(([key, value]) => getWhereFromKeyValue(key, value, opts))
    .join(" AND ");
}

const WHERE_KEY_PREFIX = "where_";

function getWhereParamKey(key: string, opts: { postfix?: string } = {}) {
  return keyToParam(`${WHERE_KEY_PREFIX}${key}${opts.postfix ?? ""}`);
}

function getWhereFromKeyValue(
  key: string,
  value: FilterValue,
  opts: { postfix?: string } = {},
) {
  if (value == undefined) {
    return `${key} IS NULL`;
  }

  if (typeof value === "object") {
    if (value[FILTER_OPTION_TYPE_SYMBOL] === "like") {
      return `${key} LIKE ${getWhereParamKey(key, opts)}`;
    }

    if (value[FILTER_OPTION_TYPE_SYMBOL] === "in") {
      return `${key} IN (${
        value[FILTER_OPTION_VALUE_SYMBOL].map(
          (_v: any, i: number) =>
            `${
              getWhereParamKey(key, {
                postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
              })
            }`,
        ).join(",")
      })`;
    }

    if (value[FILTER_OPTION_TYPE_SYMBOL] === "comparison") {
      return `${key} ${value[FILTER_OPTION_OPERATOR_SYMBOL]} ${
        getWhereParamKey(
          key,
          opts,
        )
      }`;
    }
  }
  return `${key} = ${getWhereParamKey(key, opts)}`;
}

function getParamsFromMultiFilterOption(
  collection: Collection,
  filterOptions: MultiFilterOption,
) {
  return filterOptions.reduce(
    (acc, filterOption, i) => ({
      ...acc,
      ...getParamsFromSingleFilterOption(collection, filterOption, {
        postfix: `_${i}`,
      }),
    }),
    {},
  );
}

function getParamsFromSingleFilterOption(
  collection: Collection,
  filterOptions: SingleFilterOption,
  opts: { postfix?: string } = {},
) {
  return Object.entries(filterOptions)
    .filter(([, value]) => {
      return value !== undefined;
    })
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        ...getParamsForFilterKeyValue(
          collection.fields[key]!,
          key,
          value,
          opts,
        ),
      }),
      {},
    );
}

function getParamValueFromOptionValue(field: FieldDefinition, value: any) {
  if (typeof value === "object") {
    if (value[FILTER_OPTION_TYPE_SYMBOL] === "like") {
      return value[FILTER_OPTION_VALUE_SYMBOL];
    }

    if (value[FILTER_OPTION_TYPE_SYMBOL] === "comparison") {
      return fieldValueToSQL(field, value[FILTER_OPTION_VALUE_SYMBOL]);
    }
  }

  return fieldValueToSQL(field, value);
}

function getParamsForFilterKeyValue(
  field: FieldDefinition,
  key: string,
  value: FilterValue,
  opts: { postfix?: string } = {},
) {
  if (typeof value === "object") {
    if (value[FILTER_OPTION_TYPE_SYMBOL] === "in") {
      return value[FILTER_OPTION_VALUE_SYMBOL].reduce(
        (acc: Record<string, any>, _: any, i: number) => {
          return {
            ...acc,
            [
              getWhereParamKey(key, {
                postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
              })
            ]: value[FILTER_OPTION_VALUE_SYMBOL][i],
          };
        },
        {},
      );
    }
  }

  return {
    [getWhereParamKey(key, opts)]: getParamValueFromOptionValue(field, value),
  };
}
