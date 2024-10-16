// deno-lint-ignore-file no-explicit-any

export type FilterOptions<T = any> =
  | SingleFilterOption<T>
  | MultiFilterOption<T>;

export type FilterValue<T = any, K extends keyof T = keyof T> =
  | T[K]
  | LikeFilterOption<T[K]>
  | ComparisonFilterOption<T[K]>
  | InFilterOption<T[K]>;

export type SingleFilterOption<T = any> = {
  [K in keyof T]?: FilterValue<T, K>;
};

export type MultiFilterOption<T = any> = SingleFilterOption<T>[];

export const FILTER_OPTION_TYPE_SYMBOL = "_filter_type";
export const FILTER_OPTION_VALUE_SYMBOL = "_filter_value";
export const FILTER_OPTION_OPERATOR_SYMBOL = "_filter_operator";

export type LikeFilterOption<T> = T extends string
  ? {
      [FILTER_OPTION_TYPE_SYMBOL]: "like";
      [FILTER_OPTION_VALUE_SYMBOL]: string;
    }
  : never;

export interface InFilterOption<T> {
  [FILTER_OPTION_TYPE_SYMBOL]: "in";
  [FILTER_OPTION_VALUE_SYMBOL]: T[];
}

export interface ComparisonFilterOption<T> {
  [FILTER_OPTION_TYPE_SYMBOL]: "comparison";
  [FILTER_OPTION_OPERATOR_SYMBOL]: ComparisonOperator;
  [FILTER_OPTION_VALUE_SYMBOL]: T;
}

export type ComparisonOperator = "<" | ">" | "<=" | ">=" | "<>";

export function isGreaterThan(value: any): ComparisonFilterOption<any> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "comparison",
    [FILTER_OPTION_OPERATOR_SYMBOL]: ">",
    [FILTER_OPTION_VALUE_SYMBOL]: value,
  };
}

export function isLessThan(value: any): ComparisonFilterOption<any> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "comparison",
    [FILTER_OPTION_OPERATOR_SYMBOL]: "<",
    [FILTER_OPTION_VALUE_SYMBOL]: value,
  };
}

export function isGreaterOrEqualTo(value: any): ComparisonFilterOption<any> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "comparison",
    [FILTER_OPTION_OPERATOR_SYMBOL]: ">=",
    [FILTER_OPTION_VALUE_SYMBOL]: value,
  };
}

export function isLessOrEqualTo(value: any): ComparisonFilterOption<any> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "comparison",
    [FILTER_OPTION_OPERATOR_SYMBOL]: "<=",
    [FILTER_OPTION_VALUE_SYMBOL]: value,
  };
}

export function isNotEqualTo(value: any): ComparisonFilterOption<any> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "comparison",
    [FILTER_OPTION_OPERATOR_SYMBOL]: "<>",
    [FILTER_OPTION_VALUE_SYMBOL]: value,
  };
}

export function isLike(value: string): LikeFilterOption<string> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "like",
    [FILTER_OPTION_VALUE_SYMBOL]: value,
  };
}

export function isIn<T>(values: T[]): InFilterOption<T> {
  return {
    [FILTER_OPTION_TYPE_SYMBOL]: "in",
    [FILTER_OPTION_VALUE_SYMBOL]: values,
  };
}
