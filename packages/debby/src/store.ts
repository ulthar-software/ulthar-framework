import { KeyOf } from "@ulthar/immuty";
import { ReadableCollection, WritableCollection } from "./collection.js";
import { Document } from "./types/document.js";

export abstract class Store<TSchemaMap extends Record<string, Document>> {
    public abstract from<K extends KeyOf<TSchemaMap>>(
        name: K
    ): ReadableCollection<TSchemaMap, TSchemaMap[K], K>;

    public abstract insertInto<K extends KeyOf<TSchemaMap>>(
        name: K
    ): WritableCollection<TSchemaMap[K]>;
}
