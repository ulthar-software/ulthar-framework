/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type {
  FieldDefinition,
  FilterOptions,
  FilterValue,
  Model,
  MultiFilterOption,
  SingleFilterOption,
} from "@fabric/core";
import {
  FILTER_OPTION_OPERATOR_KEY,
  FILTER_OPTION_TYPE_KEY,
  FILTER_OPTION_VALUE_KEY,
} from "@fabric/core";
import { identifierToSQL } from "./identifier-to-sql.js";
import { keyToParamKey } from "./record-utils.js";
import { fieldValueToSQL } from "./value-to-sql.js";

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

function getWhereKeyForParamKey(key: string, opts: { postfix?: string } = {}) {
  return `${WHERE_KEY_PREFIX}${key}${opts.postfix ?? ""}`;
}

function getWhereFromKeyValue(
  key: string,
  value: FilterValue,
  opts: { postfix?: string } = {},
) {
  if (value == undefined) {
    return `${identifierToSQL(key)} IS NULL`;
  }

  if (typeof value === "object") {
    if (value[FILTER_OPTION_TYPE_KEY] === "like") {
      return `${identifierToSQL(key)} LIKE ${getWhereParamKey(key, opts)}`;
    }

    if (value[FILTER_OPTION_TYPE_KEY] === "in") {
      return `${identifierToSQL(key)} IN (${value[FILTER_OPTION_VALUE_KEY].map(
        (_v: any, i: number) =>
          getWhereParamKey(key, {
            postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
          }),
      ).join(",")})`;
    }

    if (value[FILTER_OPTION_TYPE_KEY] === "comparison") {
      return `${identifierToSQL(key)} ${value[FILTER_OPTION_OPERATOR_KEY]} ${getWhereParamKey(
        key,
        opts,
      )}`;
    }
  }
  return `${identifierToSQL(key)} = ${getWhereParamKey(key, opts)}`;
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ...getParamsForFilterKeyValue(collection.fields[key], key, value, opts),
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
            [getWhereKeyForParamKey(key, {
              postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
            })]: value[FILTER_OPTION_VALUE_KEY][i],
          };
        },
        {},
      );
    }
  }

  return {
    [getWhereKeyForParamKey(key, opts)]: getParamValueFromOptionValue(
      field,
      value,
    ),
  };
}
