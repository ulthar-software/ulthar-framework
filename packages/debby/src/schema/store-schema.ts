import { KeyOf } from "@ulthar/immuty";
import { EntitySchemaDefinition } from "./entity-schema-definition.js";
import { EntityRecordFromSchema } from "./entity-record.js";
import { EntitySchema } from "./entity-schema.js";

export type TableSchemaMap<TableNames extends string> = {
    [key in TableNames]: EntitySchema<
        TableNames,
        EntitySchemaDefinition<TableNames>
    >;
};

export type TableMap<
    TableNames extends string,
    T extends TableSchemaMap<TableNames>,
> = {
    [key in TableNames]: Map<string, EntityTypeOf<TableNames, T[key]>>;
};

export type EntityTypeOf<TableNames extends string, T> = T extends EntitySchema<
    TableNames,
    infer EntitySchemaType
>
    ? EntityRecordFromSchema<TableNames, EntitySchemaType>
    : never;

export class StoreSchema<StoreType extends TableSchemaMap<KeyOf<StoreType>>> {
    constructor(private readonly tables: StoreType) {}

    getTableNames(): KeyOf<StoreType>[] {
        return Object.keys(this.tables) as KeyOf<StoreType>[];
    }

    createEntity<K extends keyof StoreType>(
        tableName: K,
        entity: EntityTypeOf<KeyOf<StoreType>, StoreType[K]>
    ): EntityTypeOf<KeyOf<StoreType>, StoreType[K]> {
        return this.tables[tableName].createEntity(entity) as EntityTypeOf<
            KeyOf<StoreType>,
            StoreType[K]
        >;
    }
}
