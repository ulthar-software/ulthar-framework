import { Effect, KeyOf, OneOf, OnlyFields } from "@ulthar/immuty";
import { EntityTypeOf, TableSchemaMap } from "./schema/store-schema.js";
import { SelectErrors } from "./errors.js";

export interface IQueryEffect<
    Tables extends TableSchemaMap<KeyOf<Tables>>,
    EntityType,
> extends JoinableEffect<Tables, EntityType>,
        WherableEffect<EntityType>,
        OrderByEffect<EntityType>,
        LimitableEffect<EntityType>,
        SelectableEffect<EntityType> {}

export interface IJoinEffect<
    Tables extends TableSchemaMap<KeyOf<Tables>>,
    EntityType,
    JoinedTableName extends KeyOf<Tables>,
    JoinedEntityType,
> extends SelectableEffect<EntityType & JoinedEntityType> {
    on(
        condition: JoinCondition<Tables, JoinedTableName>
    ): SelectableEffect<EntityType & JoinedEntityType>;
}

export type JoinCondition<
    Tables extends TableSchemaMap<KeyOf<Tables>>,
    JoinedTableName extends KeyOf<Tables>,
> = OneOf<{
    [K in Exclude<KeyOf<Tables>, JoinedTableName>]: keyof EntityTypeOf<
        KeyOf<Tables>,
        Tables[K]
    >;
}> & {
    [K in JoinedTableName]: keyof EntityTypeOf<
        KeyOf<Tables>,
        Tables[JoinedTableName]
    >;
};

export interface IWhereEffect<EntityType>
    extends OrderByEffect<EntityType>,
        LimitableEffect<EntityType>,
        SelectableEffect<EntityType> {}

export interface ILimitEffect<EntityType>
    extends SelectableEffect<EntityType> {}

export interface OrderByEffect<EntityType>
    extends SelectableEffect<EntityType>,
        LimitableEffect<EntityType> {}

export type SingleWhereCondition<EntityType> = {
    [K in keyof EntityType]?: EntityType[K];
};

export type WhereCondition<EntityType> =
    | SingleWhereCondition<EntityType>
    | SingleWhereCondition<EntityType>[];

export interface OrderCondition<EntityType> {
    key: keyof EntityType;
    direction: "asc" | "desc";
}

export type JoinableEffect<
    Tables extends TableSchemaMap<KeyOf<Tables>>,
    EntityType,
> = {
    joinWith<JoinedTableName extends KeyOf<Tables>>(
        tableName: JoinedTableName,
        type?: "left" | "inner" | "right"
    ): IJoinEffect<
        Tables,
        EntityType,
        JoinedTableName,
        EntityTypeOf<KeyOf<Tables>, Tables[JoinedTableName]>
    >;
};

export type WherableEffect<EntityType> = {
    where(condition: WhereCondition<EntityType>): IWhereEffect<EntityType>;
};

export type LimitableEffect<EntityType> = {
    limit(limit: number, offset?: number): ILimitEffect<EntityType>;
};

export type OrderableEffect<EntityType> = {
    orderBy(condition: OrderCondition<EntityType>[]): OrderByEffect<EntityType>;
};

export type SelectableEffect<EntityType> = {
    select<Fields extends KeyOf<EntityType>[]>(
        fields: Fields
    ): Effect<void, SelectedEntity<EntityType, Fields>[], SelectErrors>;
};

export type SelectedEntity<
    EntityType,
    Fields extends KeyOf<EntityType>[],
> = OnlyFields<EntityType, Fields>;
