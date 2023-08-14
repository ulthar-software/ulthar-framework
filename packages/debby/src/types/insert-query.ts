import { DocumentRecord, KeyOf } from "@ulthar/immuty";

export interface InsertQuery<
    TSchemaMap extends Record<string, DocumentRecord>,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    into: TSchemaName;
    values: TSchemaMap[TSchemaName][];
}
