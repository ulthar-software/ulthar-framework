import { KeyOf } from "@ulthar/immuty";
import { InsertEffect } from "../insert-effect.js";
import { IQueryEffect } from "../query-effect.js";
import {
    EntityTypeOf,
    StoreSchema,
    TableMap,
    TableSchemaMap,
} from "../schema/store-schema.js";
import { IStore } from "../store.js";
import { InMemoryQueryEffect } from "./in-memory-query-effect.js";
import { InMemoryInsertEffect } from "./insert-effect.js";

export class InMemoryStore<Tables extends TableSchemaMap<KeyOf<Tables>>>
    implements IStore<Tables>
{
    private tables = {} as TableMap<KeyOf<Tables>, Tables>;

    constructor(private readonly schema: StoreSchema<Tables>) {
        for (const tableName of schema.getTableNames()) {
            this.tables[tableName] = new Map();
        }
    }

    insertInto<K extends KeyOf<Tables>>(
        tableName: K
    ): InsertEffect<EntityTypeOf<KeyOf<Tables>, Tables[K]>> {
        return new InMemoryInsertEffect(this.tables[tableName]);
    }
    queryFrom<K extends KeyOf<Tables>>(
        table: K
    ): IQueryEffect<Tables, EntityTypeOf<KeyOf<Tables>, Tables[K]>> {
        return new InMemoryQueryEffect(this.tables, table);
    }
}
