import { Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { SelectQueryWrapper } from "./types/select-query.js";
import { Document } from "./types/document.js";
import { DocumentWithFields } from "./types/document-modifiers.js";
import { InsertQuery } from "./types/insert-query.js";
import {
    ConcatJoinResultsWithFields,
    FieldsFromJoinResults,
    JoinResult,
} from "./types/join-result.js";

export interface IStore<
    TSchemaMap extends Record<string, Document>,
    QueryErrors extends TaggedError = never,
    InsertErrors extends TaggedError = never,
    ConnectionErrors extends TaggedError = never,
> {
    selectSome<
        TSchemaName extends KeyOf<TSchemaMap>,
        TSchema extends TSchemaMap[TSchemaName],
        TFields extends KeyOf<TSchema>,
    >(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields>[],
        QueryErrors | ConnectionErrors
    >;

    selectAll<
        TSchemaName extends KeyOf<TSchemaMap>,
        TSchema extends TSchemaMap[TSchemaName],
    >(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<void, TSchema[], QueryErrors | ConnectionErrors>;

    selectAllWithJoins<
        TAJoinResult extends JoinResult,
        TBJoinResult extends JoinResult,
    >(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<
        void,
        (TAJoinResult & TBJoinResult)[],
        QueryErrors | ConnectionErrors
    >;

    selectSomeWithJoins<
        TAJoinResult extends JoinResult,
        TBJoinResult extends JoinResult,
        TFields extends FieldsFromJoinResults<TAJoinResult, TBJoinResult>,
    >(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<
        void,
        ConcatJoinResultsWithFields<TAJoinResult, TBJoinResult, TFields>[],
        QueryErrors | ConnectionErrors
    >;

    insert<TSchemaName extends KeyOf<TSchemaMap>>(
        query: InsertQuery<TSchemaMap, TSchemaName>
    ): Effect<void, void, InsertErrors | ConnectionErrors>;
}
