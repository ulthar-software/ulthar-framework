// deno-lint-ignore-file no-explicit-any
import {
  FILTER_OPTION_OPERATOR_KEY,
  FILTER_OPTION_TYPE_KEY,
  FILTER_OPTION_VALUE_KEY,
  FilterOptions,
  FilterValue,
  MultiFilterOption,
  SingleFilterOption,
} from "@fabric/db";
import { FieldDefinition, Model } from "@fabric/models";
import { keyToParamKey } from "./record-utils.ts";
import { fieldValueToSQL } from "./value-to-sql.ts";

export function filterToSQL(filterOptions?: FilterOptions) {
  if (!filterOptions) return "";

  if (Array.isArray(filterOptions)) {
    return `WHERE ${getWhereFromMultiOption(filterOptions)}`;
  }

  return `WHERE ${getWhereFromSingleOption(filterOptions)}`;
}

export function filterToParams(
  collection: Model,
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
  return keyToParamKey(`${WHERE_KEY_PREFIX}${key}${opts.postfix ?? ""}`);
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
    if (value[FILTER_OPTION_TYPE_KEY] === "like") {
      return `${key} LIKE ${getWhereParamKey(key, opts)}`;
    }

    if (value[FILTER_OPTION_TYPE_KEY] === "in") {
      return `${key} IN (${
        value[FILTER_OPTION_VALUE_KEY].map(
          (_v: any, i: number) =>
            `${
              getWhereParamKey(key, {
                postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
              })
            }`,
        ).join(",")
      })`;
    }

    if (value[FILTER_OPTION_TYPE_KEY] === "comparison") {
      return `${key} ${value[FILTER_OPTION_OPERATOR_KEY]} ${
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
  collection: Model,
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
  collection: Model,
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
    if (value[FILTER_OPTION_TYPE_KEY] === "like") {
      return value[FILTER_OPTION_VALUE_KEY];
    }

    if (value[FILTER_OPTION_TYPE_KEY] === "comparison") {
      return fieldValueToSQL(field, value[FILTER_OPTION_VALUE_KEY]);
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
    if (value[FILTER_OPTION_TYPE_KEY] === "in") {
      return value[FILTER_OPTION_VALUE_KEY].reduce(
        (acc: Record<string, any>, _: any, i: number) => {
          return {
            ...acc,
            [
              getWhereParamKey(key, {
                postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
              })
            ]: value[FILTER_OPTION_VALUE_KEY][i],
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
