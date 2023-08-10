import { KeyOf } from "@ulthar/immuty";
import { ReadableCollection, WritableCollection } from "../collection.js";
import { Store } from "../store.js";
import { CollectionMap } from "../types/collection-map.js";
import { Schema } from "../schema.js";
import { Document } from "../types/document.js";
import { InMemoryCollection } from "./in-memory-collection.js";

export class InMemoryStore<TSchemaMap extends Record<string, Document>>
    implements Store<TSchemaMap>
{
    static fromSchema<TSchemaMap extends Record<string, Document>>(
        schema: Schema<TSchemaMap>
    ): InMemoryStore<TSchemaMap> {
        const store = new InMemoryStore<TSchemaMap>();
        const collections = {} as CollectionMap<TSchemaMap>;
        for (const name of schema.getDocumentNames()) {
            collections[name] = new InMemoryCollection(store, name);
        }
        store.setCollectionsMap(collections);
        return store;
    }

    private collectionsMap = {} as CollectionMap<TSchemaMap>;

    private setCollectionsMap(collectionsMap: CollectionMap<TSchemaMap>): void {
        this.collectionsMap = collectionsMap;
    }

    public from<K extends KeyOf<TSchemaMap>>(
        name: K
    ): ReadableCollection<TSchemaMap, TSchemaMap[K], K> {
        return this.collectionsMap[name];
    }
    public insertInto<K extends KeyOf<TSchemaMap>>(
        name: K
    ): WritableCollection<TSchemaMap[K]> {
        return this.collectionsMap[name];
    }
}
