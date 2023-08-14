import { Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { IStore } from "../store.js";
import { Document } from "../types/document.js";
import { DocumentWithFields } from "../types/document-modifiers.js";
import { JoinOptions, JoinableEffect } from "./join-effect.js";
import { JoinResult } from "../types/join-result.js";

export class FromEffect<
    TSchemaMap extends Record<string, Document>,
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
        private name: TSchemaName
    ) {}

    selectAll(): Effect<void, TSchema[], QueryErrors | ConnectionErrors> {
        return this.store.selectAll({
            from: this.name,
        });
    }

    select<TFields extends KeyOf<TSchema>>(
        fields: TFields[]
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields>[],
        QueryErrors | ConnectionErrors
    > {
        return this.store.selectSome({
            from: this.name,
            select: {
                [this.name]: fields,
            },
        });
    }

    leftJoin<
        TOtherName extends KeyOf<TSchemaMap>,
        TOther extends TSchemaMap[TOtherName],
        TOtherAlias extends string = TOtherName,
    >(
        otherTable: TOtherName,
        opts?: JoinOptions<TOtherAlias>
    ): JoinableEffect<
        TSchemaMap,
        QueryErrors,
        ConnectionErrors,
        JoinResult<TSchemaName, TSchema>,
        JoinResult<TOtherAlias, TOther>
    > {
        return new JoinableEffect<
            TSchemaMap,
            QueryErrors,
            ConnectionErrors,
            JoinResult<TSchemaName, TSchema>,
            JoinResult<TOtherAlias, TOther>
        >(
            this.store,
            {
                from: this.name,
            },
            {
                from: otherTable,
                type: "left",
                as: opts?.as || otherTable,
                on: {},
            }
        );
    }
}
