import { EntityRecordFromSchema } from "./entity-record.js";
import { EntitySchemaDefinition } from "./entity-schema-definition.js";

export class EntitySchema<
    TableNames extends string,
    EntitySchemaType extends EntitySchemaDefinition<TableNames>,
> {
    constructor(private readonly definition: EntitySchemaType) {}

    createEntity(
        entity: EntityRecordFromSchema<TableNames, EntitySchemaType>
    ): EntityRecordFromSchema<TableNames, EntitySchemaType> {
        return entity;
    }
}
