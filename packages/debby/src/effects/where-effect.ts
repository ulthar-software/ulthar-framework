import { DocumentRecord, Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { SelectQueryWrapper } from "../types/select-query.js";
import { IStore } from "../store.js";
import {
    ConcatJoinResultsWithFields,
    FieldsFromJoinResults,
    JoinResult,
} from "../types/join-result.js";
import { DocumentWithFields } from "../types/document-modifiers.js";

export class WhereEffect<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
    TSchema extends TSchemaMap[TSchemaName] = TSchemaMap[TSchemaName],
> {
    constructor(
        private store: IStore<
            TSchemaMap,
            QueryErrors,
            TaggedError,
            ConnectionErrors
        >,
        private query: SelectQueryWrapper<TSchemaMap>
    ) {}

    select<TFields extends KeyOf<TSchema>>(
        fields: TFields[]
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields>[],
        QueryErrors | ConnectionErrors
    > {
        return this.store.selectSome({
            ...this.query,
            select: {
                [this.query.from]: fields,
            },
        });
    }

    selectAll(): Effect<void, TSchema[], QueryErrors | ConnectionErrors> {
        return this.store.selectAll(this.query);
    }
}

export class JoinedWhereEffect<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    A extends JoinResult,
    B extends JoinResult,
> {
    constructor(
        private store: IStore<
            TSchemaMap,
            QueryErrors,
            TaggedError,
            ConnectionErrors
        >,
        private query: SelectQueryWrapper<TSchemaMap>
    ) {}

    selectAll(): Effect<void, (A & B)[], QueryErrors | ConnectionErrors> {
        return this.store.selectAllWithJoins<A, B>(this.query);
    }

    select<TFields extends FieldsFromJoinResults<A, B>>(
        fields: TFields
    ): Effect<
        void,
        ConcatJoinResultsWithFields<A, B, TFields>[],
        QueryErrors | ConnectionErrors
    > {
        return this.store.selectSomeWithJoins<A, B, TFields>({
            ...this.query,
            select: fields,
        });
    }
}
