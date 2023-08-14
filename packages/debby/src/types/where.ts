import { DocumentRecord, KeyOf } from "@ulthar/immuty";

export type WhereClause<TSchema extends DocumentRecord> = {
    [key in KeyOf<TSchema>]: WhereOperator<TSchema[KeyOf<TSchema>]>;
};

export type WhereOperator<T> = T extends BasicTypes
    ? BasicWhereOperator<T>
    : ComplexWhereOperator<T>;

export type BasicWhereOperator<T extends BasicTypes> =
    | T
    | {
          in: T[];
      }
    | {
          notIn: T[];
      }
    | (T extends string ? { like: T } : never)
    | (T extends number | Date ? NumericWhereOperator<T> : never);

export type NumericWhereOperator<T extends number | Date> =
    | {
          gt: T;
      }
    | {
          gte: T;
      }
    | {
          lt: T;
      }
    | {
          lte: T;
      }
    | {
          ne: T;
      }
    | {
          between: [T, T];
      }
    | {
          notBetween: [T, T];
      };

export type ComplexWhereOperator<T> = {
    eq: T;
};

export type BasicTypes = string | number | boolean | Date | null | undefined;
