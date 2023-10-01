import { DocumentRecord, KeyOf, TaggedError } from "@ulthar/effecty";
import { FromEffect, InsertEffect } from "./index.js";
import { IStoreDriver } from "./store-driver.js";
import { DeleteEffect } from "./effects/delete-effect.js";
import { UpdateEffect } from "./effects/update-effect.js";

export class Store<
    TSchemaMap extends Record<string, DocumentRecord>,
    QueryErrors extends TaggedError = never,
    InsertErrors extends TaggedError = never,
    UpdateErrors extends TaggedError = never,
    DeleteErrors extends TaggedError = never,
    ConnectionErrors extends TaggedError = never,
> {
    constructor(
        private driver: IStoreDriver<
            TSchemaMap,
            QueryErrors,
            InsertErrors,
            UpdateErrors,
            DeleteErrors,
            ConnectionErrors
        >
    ) {}

    getDriver() {
        return this.driver;
    }

    from<TSchemaName extends KeyOf<TSchemaMap>>(schemaName: TSchemaName) {
        return new FromEffect<
            TSchemaMap,
            QueryErrors,
            ConnectionErrors,
            TSchemaName
        >(this, schemaName);
    }

    insertInto<TSchemaName extends KeyOf<TSchemaMap>>(schemaName: TSchemaName) {
        return new InsertEffect<
            TSchemaMap,
            InsertErrors,
            ConnectionErrors,
            TSchemaName
        >(this, schemaName);
    }

    deleteFrom<TSchemaName extends KeyOf<TSchemaMap>>(schemaName: TSchemaName) {
        return new DeleteEffect<
            TSchemaMap,
            DeleteErrors,
            ConnectionErrors,
            TSchemaName
        >(this, schemaName);
    }

    update<TSchemaName extends KeyOf<TSchemaMap>>(schemaName: TSchemaName) {
        return new UpdateEffect<
            TSchemaMap,
            UpdateErrors,
            ConnectionErrors,
            TSchemaName
        >(this, schemaName);
    }
}
