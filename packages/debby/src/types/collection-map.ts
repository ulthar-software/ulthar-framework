import { KeyOf } from "@ulthar/immuty";
import { Collection } from "../collection.js";
import { Document } from "./document.js";

export type CollectionMap<TSchemaMap extends Record<string, Document>> = {
    [K in KeyOf<TSchemaMap>]: Collection<TSchemaMap, TSchemaMap[K], K>;
};
