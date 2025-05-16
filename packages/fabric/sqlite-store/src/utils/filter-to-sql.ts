/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  exhaustiveCheck,
  FILTER_OPTION_OPERATOR_KEY,
  FILTER_OPTION_TYPE_KEY,
  FILTER_OPTION_VALUE_KEY,
  isSpecialFilterOption,
} from "@fabric/core";
import type { JoinOptions } from "../../../core/dist/domain/value-store/queries/read/join-types.js";
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
  joins: JoinOptions<any, any, any>[] = [],
  filterOptions?: FilterOptions,
) {
  if (!filterOptions) return {};

  const joinsMap = joins.reduce<Record<string, Model>>((acc, join) => {
    acc[join.as] = join.model;
    return acc;
  }, {});

  if (Array.isArray(filterOptions)) {
    return getParamsFromMultiFilterOption(collection, joinsMap, filterOptions);
  }

  return getParamsFromSingleFilterOption(collection, joinsMap, filterOptions);
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
  return `${WHERE_KEY_PREFIX}${key}${opts.postfix ?? ""}`.replace(/\./g, "_");
}

function getWhereFromKeyValue(
  key: string,
  value: FilterValue,
  opts: { postfix?: string } = {},
) {
  if (value == undefined) {
    return `${identifierToSQL(key)} IS NULL`;
  }

  if (isSpecialFilterOption<any>(value)) {
    switch (value[FILTER_OPTION_TYPE_KEY]) {
      case "like":
        return `${identifierToSQL(key)} LIKE ${getWhereParamKey(key, opts)}`;
      case "in":
        return `${identifierToSQL(key)} IN (${value[
          FILTER_OPTION_VALUE_KEY
        ].map((_v: any, i: number) =>
          getWhereParamKey(key, {
            postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
          }),
        ).join(",")})`;
      case "not_in":
        return `${identifierToSQL(key)} NOT IN (${value[
          FILTER_OPTION_VALUE_KEY
        ].map((_v: any, i: number) =>
          getWhereParamKey(key, {
            postfix: opts.postfix ? `${opts.postfix}_${i}` : `_${i}`,
          }),
        ).join(",")})`;
      case "comparison":
        return `${identifierToSQL(key)} ${value[FILTER_OPTION_OPERATOR_KEY]} ${getWhereParamKey(
          key,
          opts,
        )}`;
      default: {
        exhaustiveCheck(value[FILTER_OPTION_TYPE_KEY]);
      }
    }
  }
  return `${identifierToSQL(key)} = ${getWhereParamKey(key, opts)}`;
}

function getParamsFromMultiFilterOption(
  collection: Model,
  joins: Record<string, Model>,
  filterOptions: MultiFilterOption,
) {
  return filterOptions.reduce(
    (acc, filterOption, i) => ({
      ...acc,
      ...getParamsFromSingleFilterOption(collection, joins, filterOption, {
        postfix: `_${i}`,
      }),
    }),
    {},
  );
}

function getParamsFromSingleFilterOption(
  collection: Model,
  joins: Record<string, Model>,
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
          getField(collection, joins, key),
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
  if (isSpecialFilterOption<any>(value)) {
    switch (value[FILTER_OPTION_TYPE_KEY]) {
      case "in":
      case "not_in": {
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
      case "like":
      case "comparison": {
        return {
          [getWhereKeyForParamKey(key, opts)]: getParamValueFromOptionValue(
            field,
            value,
          ),
        };
      }
      default: {
        exhaustiveCheck(value[FILTER_OPTION_TYPE_KEY]);
      }
    }
  }

  return {
    [getWhereKeyForParamKey(key, opts)]: getParamValueFromOptionValue(
      field,
      value,
    ),
  };
}
function getField(
  collection: Model,
  joins: Record<string, Model>,
  key: string,
): FieldDefinition {
  if (key.includes(".")) {
    return getFieldFromJoin(joins, key);
  } else {
    return collection.fields[key];
  }
}
function getFieldFromJoin(
  joins: Record<string, Model>,
  key: string,
): FieldDefinition {
  const [joinKey, fieldKey] = key.split(".");

  const model = joins[joinKey];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!model) {
    throw new Error(`Join not found for key: ${key}`);
  }

  if (!model.fields[fieldKey]) {
    throw new Error(`Field not found for key: ${key}`);
  }

  return model.fields[fieldKey];
}
