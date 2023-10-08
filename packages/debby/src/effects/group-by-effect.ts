import { SomeRecord, Effect, KeyOf, TaggedError } from "@ulthar/effecty";
import { Store } from "../store.js";
import { SelectQuery } from "../types/select-query.js";
import { DocumentWithFields } from "../types/document-modifiers.js";
import { DocumentAggregators } from "../aggregators.js";

export class GroupByEffect<
    TSchemaMap extends Record<string, SomeRecord>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
    TSchema extends TSchemaMap[TSchemaName],
    TGroupByFields extends KeyOf<TSchema>,
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
        const selectedFields = fields.filter(
            (field) => typeof field === "string"
        ) as string[];
        const aggregators = fields.filter(
            (field) => typeof field !== "string"
        ) as DocumentAggregators<KeyOf<TSchema>, AddedKeys>[];

        return this.store
            .getDriver()
            .select<TSchemaName, TSchema, TFields | TGroupByFields>({
                ...this.query,
                select: {
                    [this.query.from]: selectedFields,
                },
                ...(aggregators.length > 0 && {
                    aggregates: {
                        [this.query.from]: aggregators,
                    },
                }),
            });
    }
}
