import { SomeRecord, KeyOf } from "@ulthar/effecty";

export interface InsertQuery<
    TSchemaMap extends Record<string, SomeRecord>,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    into: TSchemaName;
    values: TSchemaMap[TSchemaName][];
}
