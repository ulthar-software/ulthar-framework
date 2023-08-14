import { DocumentRecord, KeyOf, TaggedError } from "@ulthar/immuty";
import { IStore } from "./store.js";
import { FromEffect } from "./effects/from-effect.js";
import { InsertEffect } from "./effects/insert-effect.js";

export class QueryInterface<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError,
    InsertErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
> {
    constructor(
        private readonly store: IStore<
            TSchemaMap,
            QueryErrors,
            InsertErrors,
            ConnectionErrors
        >
    ) {}

    from<TSchemaName extends KeyOf<TSchemaMap>>(schemaName: TSchemaName) {
        return new FromEffect<
            TSchemaMap,
            QueryErrors,
            ConnectionErrors,
            TSchemaName
        >(this.store, schemaName);
    }

    insertInto<TSchemaName extends KeyOf<TSchemaMap>>(schemaName: TSchemaName) {
        return new InsertEffect<
            TSchemaMap,
            InsertErrors,
            ConnectionErrors,
            TSchemaName
        >(this.store, schemaName);
    }
}

export function use<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError,
    InsertErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
>(store: IStore<TSchemaMap, QueryErrors, InsertErrors, ConnectionErrors>) {
    return new QueryInterface(store);
}
