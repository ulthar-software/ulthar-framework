import { Effect, KeyOf, copyFields } from "@ulthar/immuty";
import { IEntityRecord } from "../entity.js";
import { SelectedEntity, WhereCondition } from "../query-effect.js";

export function getEntityList<EntityType extends IEntityRecord>(
    table: Map<string, EntityType>
): Effect<void, EntityType[]> {
    return Effect.fromSync(() => Array.from(table.values()));
}

export function selectFromEntities<
    EntityType extends IEntityRecord,
    Fields extends KeyOf<EntityType>[],
>(
    entityList: EntityType[],
    fields: Fields
): Effect<void, SelectedEntity<EntityType, Fields>[]> {
    return Effect.fromSync(() => {
        return entityList.map((entity) => copyFields(entity, fields));
    });
}

export function filterTable<EntityType extends IEntityRecord>(
    entities: EntityType[],
    condition: WhereCondition<EntityType>
): Effect<void, EntityType[]> {
    return Effect.fromSync(() => entities.filter((x) => isMatch(x, condition)));
}

function isMatch<EntityType extends IEntityRecord>(
    entity: EntityType,
    condition: WhereCondition<EntityType>
): boolean {
    if (Array.isArray(condition)) {
        return condition.some((single) => isMatch(entity, single));
    }

    return Object.entries(condition).every(
        ([key, value]) => entity[key as keyof EntityType] === value
    );
}
