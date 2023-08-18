import { DocumentRecord, Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { IStore } from "../store.js";
import { SelectQueryWrapper } from "../types/select-query.js";
import { DocumentWithFields } from "../types/document-modifiers.js";
import { DocumentAggregators } from "../aggregators.js";

export class GroupByEffect<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
    TSchema extends TSchemaMap[TSchemaName],
    TGroupByFields extends KeyOf<TSchema>,
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

    select<
        AddedKeys extends string,
        TFields extends
            | KeyOf<TSchema>
            | DocumentAggregators<KeyOf<TSchema>, AddedKeys>,
    >(
        fields: TFields[]
    ): Effect<
        void,
        DocumentWithFields<TSchema, TFields | TGroupByFields>[],
        QueryErrors | ConnectionErrors
    > {
        return this.store.selectSome({
            ...this.query,
            select: {
                [this.query.from]: fields,
            },
        });
    }
}
