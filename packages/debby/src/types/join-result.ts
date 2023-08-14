import { KeyOf } from "@ulthar/immuty";
import { Document } from "./document.js";

export type JoinResult<
    TName extends string = string,
    TSchema extends Document = Document,
> = {
    [K in TName]: TSchema;
};

export type FieldsFromJoinResults<
    TAJoinResult extends JoinResult,
    TBJoinResult extends JoinResult,
> = {
    [K in KeyOf<TAJoinResult>]: KeyOf<TAJoinResult[K]>[];
} & {
    [K in KeyOf<TBJoinResult>]: KeyOf<TAJoinResult[K]>[];
};

export type ConcatJoinResultsWithFields<
    TAJoinResult extends JoinResult,
    TBJoinResult extends JoinResult,
    TFields extends FieldsFromJoinResults<TAJoinResult, TBJoinResult>,
> = {
    [K in KeyOf<TAJoinResult>]: {
        [F in TFields[K][number]]: TAJoinResult[K][F];
    };
} & {
    [K in KeyOf<TBJoinResult>]: {
        [F in TFields[K][number]]: TBJoinResult[K][F];
    };
};
