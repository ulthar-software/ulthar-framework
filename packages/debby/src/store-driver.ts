import { SomeRecord, Effect, KeyOf, TaggedError } from "@ulthar/effecty";
import { DocumentAggregators } from "./aggregators.js";
import {
    ConcatJoinResultsWithFields,
    DocumentWithFields,
    FieldsFromJoinResults,
    InsertQuery,
    JoinResult,
    SelectQuery,
} from "./index.js";
import { UpdateQuery } from "./types/update-query.js";
import { DeleteQuery } from "./types/delete-query.js";

export interface IStoreDriver<
    TSchemaMap extends Record<string, SomeRecord>,
    QueryErrors extends TaggedError = never,
    InsertErrors extends TaggedError = never,
    UpdateErrors extends TaggedError = never,
    DeleteErrors extends TaggedError = never,
    ConnectionErrors extends TaggedError = never,
> {
    select<
        TSchemaName extends KeyOf<TSchemaMap>,
        TSchema extends TSchemaMap[TSchemaName],
        TFields extends
            | KeyOf<TSchema>
            | DocumentAggregators<KeyOf<TSchema>, string>,
    >(
        query: SelectQuery<TSchemaMap>
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields>[],
        QueryErrors | ConnectionErrors
    >;
    select<
        TSchemaName extends KeyOf<TSchemaMap>,
        TSchema extends TSchemaMap[TSchemaName],
    >(
        query: SelectQuery<TSchemaMap>
    ): Effect<void, TSchema[], QueryErrors | ConnectionErrors>;
    select<TAJoinResult extends JoinResult, TBJoinResult extends JoinResult>(
        query: SelectQuery<TSchemaMap>
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
        query: SelectQuery<TSchemaMap>
    ): Effect<
        void,
        ConcatJoinResultsWithFields<TAJoinResult, TBJoinResult, TFields>[],
        QueryErrors | ConnectionErrors
    >;

    insert<TSchemaName extends KeyOf<TSchemaMap>>(
        query: InsertQuery<TSchemaMap, TSchemaName>
    ): Effect<void, void, InsertErrors | ConnectionErrors>;

    update<TSchemaName extends KeyOf<TSchemaMap>>(
        query: UpdateQuery<TSchemaMap, TSchemaName>
    ): Effect<void, void, UpdateErrors | ConnectionErrors>;

    delete<TSchemaName extends KeyOf<TSchemaMap>>(
        query: DeleteQuery<TSchemaMap, TSchemaName>
    ): Effect<void, void, DeleteErrors | ConnectionErrors>;
}
