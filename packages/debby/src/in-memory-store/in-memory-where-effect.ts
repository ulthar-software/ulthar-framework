import { Effect, KeyOf } from "@ulthar/immuty";
import { IEntityRecord } from "../entity.js";
import {
    ILimitEffect,
    IWhereEffect,
    SelectedEntity,
    WhereCondition,
} from "../query-effect.js";
import { filterTable, selectFromEntities } from "./utils.js";

export class InMemoryWhereEffect<EntityType extends IEntityRecord>
    implements IWhereEffect<EntityType>
{
    constructor(
        private tableListEffect: Effect<void, EntityType[]>,
        private condition: WhereCondition<EntityType>
    ) {}

    select<Fields extends KeyOf<EntityType>[]>(
        fields: Fields
    ): Effect<void, SelectedEntity<EntityType, Fields>[]> {
        return this.tableListEffect
            .flatMap((list) => {
                return filterTable(list, this.condition);
            })
            .flatMap((list) => {
                return selectFromEntities(list, fields);
            });
    }
    limit() // limit: number, offset: number
    : ILimitEffect<EntityType> {
        throw new Error("Method not implemented.");
    }
}
