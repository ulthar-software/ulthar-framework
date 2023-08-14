/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentRecord, KeyOf, Maybe, NonMaybe } from "@ulthar/immuty";

export type JoinResult<
    TName extends string = string,
    TSchema extends Maybe<DocumentRecord> = any,
> = {
    [K in TName]: TSchema;
};

export type FieldsFromJoinResults<
    TAJoinResult extends JoinResult,
    TBJoinResult extends JoinResult,
> = {
    [K in KeyOf<TAJoinResult>]: KeyOf<NonMaybe<TAJoinResult[K]>>[];
} & {
    [K in KeyOf<TBJoinResult>]: KeyOf<NonMaybe<TBJoinResult[K]>>[];
};

export type ConcatJoinResultsWithFields<
    TAJoinResult extends JoinResult,
    TBJoinResult extends JoinResult,
    TFields extends FieldsFromJoinResults<TAJoinResult, TBJoinResult>,
> = {
    [K in KeyOf<TAJoinResult>]: {
        [F in TFields[K][number]]: NonMaybe<TAJoinResult[K]>[F];
    };
} & {
    [K in KeyOf<TBJoinResult>]: {
        [F in TFields[K][number]]: NonMaybe<TBJoinResult[K]>[F];
    };
};
