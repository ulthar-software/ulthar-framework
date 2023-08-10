import { KeyOf } from "@ulthar/immuty";
import { Document } from "../types/document.js";
import { SchemaTypes } from "./schema-types.js";

export type DocumentSchemaMap<TSchemaMap extends Record<string, Document>> = {
    [K in KeyOf<TSchemaMap>]: DocumentSchema<TSchemaMap, TSchemaMap[K]>;
};

export type DocumentSchema<
    TSchemaMap extends Record<string, Document>,
    TSchema extends Document,
> = {
    [K in KeyOf<TSchema>]: SchemaTypes<KeyOf<TSchemaMap>>;
};
