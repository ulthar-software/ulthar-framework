import {
    DocumentRecord,
    Effect,
    KeyOf,
    Maybe,
    TaggedError,
} from "@ulthar/immuty";
import { Store } from "../store.js";
import { DocumentWithFields } from "../types/document-modifiers.js";
import { JoinOptions, JoinableEffect } from "./join-effect.js";
import { JoinResult } from "../types/join-result.js";
import { WhereClause } from "../types/where.js";
import { WhereEffect } from "./where-effect.js";
import { GroupByEffect } from "./group-by-effect.js";

export class FromEffect<
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
        private name: TSchemaName
    ) {}

    selectAll(): Effect<void, TSchema[], QueryErrors | ConnectionErrors> {
        return this.store.getDriver().select<TSchemaName, TSchema>({
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
        return this.store.getDriver().select<TSchemaName, TSchema, TFields>({
            from: this.name,
            select: {
                [this.name]: fields,
            },
        });
    }

    where(
        ops: WhereClause<TSchema> | WhereClause<TSchema>[]
    ): WhereEffect<
        TSchemaMap,
        QueryErrors,
        ConnectionErrors,
        TSchemaName,
        TSchema
    > {
        return new WhereEffect(this.store, {
            from: this.name,
            where: Array.isArray(ops)
                ? ops.map((op) => ({ [this.name]: op }))
                : [{ [this.name]: ops }],
        });
    }

    groupBy<TGroupByFields extends KeyOf<TSchema>>(
        fields: TGroupByFields[]
    ): GroupByEffect<
        TSchemaMap,
        QueryErrors,
        ConnectionErrors,
        TSchemaName,
        TSchema,
        TGroupByFields
    > {
        return new GroupByEffect(this.store, {
            from: this.name,
            groupBy: {
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
        JoinResult<TOtherAlias, Maybe<TOther>>
    > {
        return new JoinableEffect(
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

    rightJoin<
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
        JoinResult<TSchemaName, Maybe<TSchema>>,
        JoinResult<TOtherAlias, TOther>
    > {
        return new JoinableEffect(
            this.store,
            {
                from: this.name,
            },
            {
                from: otherTable,
                type: "right",
                as: opts?.as || otherTable,
                on: {},
            }
        );
    }

    innerJoin<
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
        return new JoinableEffect(
            this.store,
            {
                from: this.name,
            },
            {
                from: otherTable,
                type: "inner",
                as: opts?.as || otherTable,
                on: {},
            }
        );
    }

    fullJoin<
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
        JoinResult<TSchemaName, Maybe<TSchema>>,
        JoinResult<TOtherAlias, Maybe<TOther>>
    > {
        return new JoinableEffect(
            this.store,
            {
                from: this.name,
            },
            {
                from: otherTable,
                type: "full",
                as: opts?.as || otherTable,
                on: {},
            }
        );
    }
}
