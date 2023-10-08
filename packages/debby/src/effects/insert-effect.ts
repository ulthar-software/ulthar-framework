import { SomeRecord, Effect, KeyOf, TaggedError } from "@ulthar/effecty";
import { Store } from "../store.js";

export class InsertEffect<
    TSchemaMap extends Record<string, SomeRecord>,
    InsertErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    constructor(
        private store: Store<
            TSchemaMap,
            TaggedError,
            InsertErrors,
            TaggedError,
            TaggedError,
            ConnectionErrors
        >,
        private name: TSchemaName
    ) {}

    values(
        values: TSchemaMap[TSchemaName][]
    ): Effect<void, void, InsertErrors | ConnectionErrors> {
        return this.store.getDriver().insert({
            into: this.name,
            values,
        });
    }
}
