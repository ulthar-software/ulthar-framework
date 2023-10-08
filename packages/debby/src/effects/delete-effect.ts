import { SomeRecord, Effect, KeyOf, TaggedError } from "@ulthar/effecty";
import { Store } from "../store.js";
import { WhereClause } from "../index.js";

export class DeleteEffect<
    TSchemaMap extends Record<string, SomeRecord>,
    DeleteErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
    TSchema extends TSchemaMap[TSchemaName] = TSchemaMap[TSchemaName],
> {
    constructor(
        private store: Store<
            TSchemaMap,
            TaggedError,
            TaggedError,
            TaggedError,
            DeleteErrors,
            ConnectionErrors
        >,
        private name: TSchemaName
    ) {}

    all(): Effect<void, void, DeleteErrors | ConnectionErrors> {
        return this.store.getDriver().delete({
            from: this.name,
        });
    }

    where(
        ops: WhereClause<TSchema> | WhereClause<TSchema>[]
    ): Effect<void, void, DeleteErrors | ConnectionErrors> {
        return this.store.getDriver().delete({
            from: this.name,
            where: Array.isArray(ops) ? ops : [ops],
        });
    }
}
