import { Effect, KeyOf } from "@ulthar/immuty";
import { IEntityRecord } from "../entity.js";
import {
    IJoinEffect,
    ILimitEffect,
    IQueryEffect,
    IWhereEffect,
    SelectedEntity,
    WhereCondition,
} from "../query-effect.js";
import {
    EntityTypeOf,
    TableMap,
    TableSchemaMap,
} from "../schema/store-schema.js";
import { InMemoryWhereEffect } from "./in-memory-where-effect.js";
import { SelectErrors } from "../errors.js";
import { getEntityList, selectFromEntities } from "./utils.js";
import { InMemoryLimitEffect } from "./in-memory-limit-effect.js";

export class InMemoryQueryEffect<
    TablesSchema extends TableSchemaMap<KeyOf<TablesSchema>>,
    EntityType extends IEntityRecord,
> implements IQueryEffect<TablesSchema, EntityType>
{
    private table: Map<string, EntityType>;

    constructor(
        private tables: TableMap<KeyOf<TablesSchema>, TablesSchema>,
        private tableName: KeyOf<TablesSchema>
    ) {
        this.table = this.tables[this.tableName] as unknown as Map<
            string,
            EntityType
        >;
    }

    where(condition: WhereCondition<EntityType>): IWhereEffect<EntityType> {
        return new InMemoryWhereEffect(getEntityList(this.table), condition);
    }

    select<Fields extends KeyOf<EntityType>[]>(
        fields: Fields
    ): Effect<void, SelectedEntity<EntityType, Fields>[], SelectErrors> {
        return getEntityList(this.table).flatMap((list) => {
            return selectFromEntities(list, fields);
        });
    }

    limit(limit: number, offset?: number): ILimitEffect<EntityType> {
        return new InMemoryLimitEffect(
            getEntityList(this.table),
            limit,
            offset ?? 0
        );
    }

    joinWith<
        JoinedTableName extends KeyOf<TablesSchema>,
    >() // type?: "left" | "inner" | "right" | undefined // tableName: JoinedTableName,
    : IJoinEffect<
        TablesSchema,
        EntityType,
        JoinedTableName,
        EntityTypeOf<KeyOf<TablesSchema>, TablesSchema[JoinedTableName]>
    > {
        throw new Error("Method not implemented.");
    }
}
