import { IEntityRecord } from "../entity.js";
import { EntitySchemaDefinition } from "./entity-schema-definition.js";
import { TypescriptTypeOf } from "./types.js";

export type EntityRecordFromSchema<
    TableNames extends string,
    SchemaType extends EntitySchemaDefinition<TableNames>,
> = IEntityRecord & {
    [K in keyof SchemaType]: TypescriptTypeOf<SchemaType[K]>;
};
