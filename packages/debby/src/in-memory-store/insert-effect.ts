import { Effect } from "@ulthar/immuty";
import { IEntityRecord } from "../entity.js";
import { InsertEffect } from "../insert-effect.js";

export class InMemoryInsertEffect<EntityType extends IEntityRecord>
    implements InsertEffect<EntityType>
{
    constructor(private table: Map<string, EntityType>) {}

    values(values: EntityType | EntityType[]): Effect {
        return Effect.fromSync(() => {
            if (Array.isArray(values)) {
                values.forEach((value) => {
                    this.table.set(value.id, value);
                });
                return;
            }
            this.table.set(values.id, values);
        });
    }
}
