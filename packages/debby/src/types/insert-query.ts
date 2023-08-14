import { KeyOf } from "@ulthar/immuty";
import { Document } from "./document.js";

export interface InsertQuery<
    TSchemaMap extends Record<string, Document>,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    into: TSchemaName;
    values: TSchemaMap[TSchemaName][];
}
