import { SomeRecord, KeyOf } from "@ulthar/effecty";
import { SchemaTypes } from "./schema-types.js";

export type RecordsSchemaMap<TSchemaMap extends Record<string, SomeRecord>> = {
    [K in KeyOf<TSchemaMap>]: RecordsSchema<TSchemaMap, TSchemaMap[K]>;
};

export type RecordsSchema<
    TSchemaMap extends Record<string, SomeRecord>,
    TSchema extends SomeRecord,
> = {
    [K in KeyOf<TSchema>]: SchemaTypes<KeyOf<TSchemaMap>>;
};
