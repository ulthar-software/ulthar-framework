import { DocumentRecord, Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { SelectQueryWrapper } from "./types/select-query.js";
import { DocumentWithFields } from "./types/document-modifiers.js";
import { InsertQuery } from "./types/insert-query.js";
import {
    ConcatJoinResultsWithFields,
    FieldsFromJoinResults,
    JoinResult,
} from "./types/join-result.js";
import { DocumentAggregators } from "./aggregators.js";

export interface IStore<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError = never,
    InsertErrors extends TaggedError = never,
    ConnectionErrors extends TaggedError = never,
> {
    select<
        TSchemaName extends KeyOf<TSchemaMap>,
        TSchema extends TSchemaMap[TSchemaName],
        TFields extends
            | KeyOf<TSchema>
            | DocumentAggregators<KeyOf<TSchema>, string>,
    >(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields>[],
        QueryErrors | ConnectionErrors
    >;
    select<
        TSchemaName extends KeyOf<TSchemaMap>,
        TSchema extends TSchemaMap[TSchemaName],
    >(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<void, TSchema[], QueryErrors | ConnectionErrors>;
    select<TAJoinResult extends JoinResult, TBJoinResult extends JoinResult>(
        query: SelectQueryWrapper<TSchemaMap>
    ): Effect<
        void,
        (TAJoinResult & TBJoinResult)[],
        QueryErrors | ConnectionErrors
    >;
    select<
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
