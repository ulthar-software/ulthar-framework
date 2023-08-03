import { PRIMARY_KEY } from "./type-modifiers.js";
import { SchemaTypes, UUID } from "./types.js";

export type EntitySchemaDefinition<TableNames extends string> = {
    id: UUID & PRIMARY_KEY;
    [key: string]: SchemaTypes<TableNames>;
};
