import { DocumentRecord, Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { SelectQuery } from "../types/select-query.js";
import { Store } from "../store.js";
import {
    ConcatJoinResultsWithFields,
    FieldsFromJoinResults,
    JoinResult,
} from "../types/join-result.js";
import { DocumentWithFields } from "../types/document-modifiers.js";
import { UpdateQuery } from "../index.js";

export class WhereEffect<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
    TSchema extends TSchemaMap[TSchemaName] = TSchemaMap[TSchemaName],
> {
    constructor(
        private store: Store<
            TSchemaMap,
            QueryErrors,
            TaggedError,
            TaggedError,
            TaggedError,
            ConnectionErrors
        >,
        private query: SelectQuery<TSchemaMap>
    ) {}

    select<TFields extends KeyOf<TSchema>>(
        fields: TFields[]
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields>[],
        QueryErrors | ConnectionErrors
    > {
        return this.store.getDriver().select<TSchemaName, TSchema, TFields>({
            ...this.query,
            select: {
                [this.query.from]: fields,
            },
        });
    }

    selectAll(): Effect<void, TSchema[], QueryErrors | ConnectionErrors> {
        return this.store.getDriver().select<TSchemaName, TSchema>(this.query);
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
        private store: Store<
            TSchemaMap,
            QueryErrors,
            TaggedError,
            TaggedError,
            TaggedError,
            ConnectionErrors
        >,
        private query: SelectQuery<TSchemaMap>
    ) {}

    selectAll(): Effect<void, (A & B)[], QueryErrors | ConnectionErrors> {
        return this.store.getDriver().select<A, B>(this.query);
    }

    select<TFields extends FieldsFromJoinResults<A, B>>(
        fields: TFields
    ): Effect<
        void,
        ConcatJoinResultsWithFields<A, B, TFields>[],
        QueryErrors | ConnectionErrors
    > {
        return this.store.getDriver().select<A, B, TFields>({
            ...this.query,
            select: fields,
        });
    }
}

export class UpdateWhereEffect<
    TSchemaMap extends Record<string, DocumentRecord>,
    UpdateErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
    TSchema extends TSchemaMap[TSchemaName] = TSchemaMap[TSchemaName],
> {
    constructor(
        private store: Store<
            TSchemaMap,
            TaggedError,
            TaggedError,
            UpdateErrors,
            TaggedError,
            ConnectionErrors
        >,
        private query: UpdateQuery<TSchemaMap, TSchemaName>
    ) {}

    set(
        value: Partial<TSchema>
    ): Effect<void, void, UpdateErrors | ConnectionErrors> {
        return this.store.getDriver().update({
            ...this.query,
            set: value,
        });
    }
}
