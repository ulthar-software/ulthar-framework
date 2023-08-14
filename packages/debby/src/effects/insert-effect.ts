import { Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { IStore } from "../store.js";
import { Document } from "../types/document.js";

export class InsertEffect<
    TSchemaMap extends Record<string, Document>,
    InsertErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    constructor(
        private store: IStore<
            TSchemaMap,
            TaggedError,
            InsertErrors,
            ConnectionErrors
        >,
        private name: TSchemaName
    ) {}

    values(
        values: TSchemaMap[TSchemaName][]
    ): Effect<void, void, InsertErrors | ConnectionErrors> {
        return this.store.insert({
            into: this.name,
            values,
        });
    }
}
