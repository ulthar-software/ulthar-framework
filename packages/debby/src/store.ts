import { KeyOf } from "@ulthar/immuty";
import { InsertEffect } from "./insert-effect.js";
import { IQueryEffect } from "./query-effect.js";
import {
    EntityTypeOf,
    StoreSchema,
    TableSchemaMap,
} from "./schema/store-schema.js";

export interface IStore<Tables extends TableSchemaMap<KeyOf<Tables>>> {
    insertInto<K extends KeyOf<Tables>>(
        tableName: K
    ): InsertEffect<EntityTypeOf<KeyOf<Tables>, Tables[K]>>;

    queryFrom<K extends KeyOf<Tables>>(
        table: K
    ): IQueryEffect<Tables, EntityTypeOf<KeyOf<Tables>, Tables[K]>>;
}

export type createFromSchema = <Tables extends TableSchemaMap<KeyOf<Tables>>>(
    schema: StoreSchema<Tables>
) => IStore<Tables>;
