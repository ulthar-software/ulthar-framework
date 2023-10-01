import { DocumentRecord, Effect, KeyOf, TaggedError } from "@ulthar/effecty";
import { Store } from "../store.js";
import { UpdateWhereEffect, WhereClause } from "../index.js";

export class UpdateEffect<
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
        private name: TSchemaName
    ) {}

    setAll(
        value: Partial<TSchema>
    ): Effect<void, void, UpdateErrors | ConnectionErrors> {
        return this.store.getDriver().update({
            from: this.name,
            set: value,
        });
    }

    where(ops: WhereClause<TSchema> | WhereClause<TSchema>[]) {
        return new UpdateWhereEffect<
            TSchemaMap,
            UpdateErrors,
            ConnectionErrors,
            TSchemaName,
            TSchema
        >(this.store, {
            from: this.name,
            where: Array.isArray(ops) ? ops : [ops],
        });
    }
}
