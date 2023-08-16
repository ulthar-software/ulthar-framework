import { DocumentRecord, KeyOf } from "@ulthar/immuty";
import { JoinResult } from "./join-result.js";

export type WhereClause<TSchema extends DocumentRecord> = {
    [key in KeyOf<TSchema>]?: WhereOperator<TSchema[KeyOf<TSchema>]>;
};

export type JoinWhereClause<
    A extends JoinResult = JoinResult,
    B extends JoinResult = JoinResult,
> = {
    [key in KeyOf<A>]?: WhereClause<A[key]>;
} & {
    [key in KeyOf<B>]?: WhereClause<B[key]>;
};

export type WhereOperator<T> = T extends BasicTypes
    ? BasicWhereOperator<T>
    : never;

export type BasicWhereOperator<T extends BasicTypes> =
    | {
          eq: T;
      }
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

export type BasicTypes = string | number | boolean | Date | null | undefined;
