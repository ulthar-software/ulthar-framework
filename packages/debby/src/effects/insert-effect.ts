import { DocumentRecord, Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { Store } from "../store.js";

export class InsertEffect<
    TSchemaMap extends Record<string, DocumentRecord>,
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
