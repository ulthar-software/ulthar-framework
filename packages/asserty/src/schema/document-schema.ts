import { DocumentRecord, KeyOf } from "@ulthar/effecty";
import { SchemaTypes } from "./schema-types.js";

export type DocumentSchemaMap<
    TSchemaMap extends Record<string, DocumentRecord>,
> = {
    [K in KeyOf<TSchemaMap>]: DocumentSchema<TSchemaMap, TSchemaMap[K]>;
};

export type DocumentSchema<
    TSchemaMap extends Record<string, DocumentRecord>,
    TSchema extends DocumentRecord,
> = {
    [K in KeyOf<TSchema>]: SchemaTypes<KeyOf<TSchemaMap>>;
};
