import { KeyOf, Effect, TaggedError } from "@ulthar/immuty";
import { IEntityRecord } from "../entity.js";
import { ILimitEffect, SelectedEntity } from "../query-effect.js";
import { selectFromEntities } from "./utils.js";

export class InMemoryLimitEffect<EntityType extends IEntityRecord>
    implements ILimitEffect<EntityType>
{
    constructor(
        private effect: Effect<void, EntityType[]>,
        private limit: number,
        private offset: number
    ) {}

    select<Fields extends KeyOf<EntityType>[]>(
        fields: Fields
    ): Effect<
        void,
        SelectedEntity<EntityType, Fields>[],
        TaggedError<"UnknownTable">
    > {
        return this.effect
            .mapSync(([list]) => {
                return list.slice(this.offset, this.offset + this.limit);
            })
            .flatMap((list) => {
                return selectFromEntities(list, fields);
            });
    }
}
