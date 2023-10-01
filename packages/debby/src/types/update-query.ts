import { DocumentRecord, KeyOf } from "@ulthar/effecty";
import { WhereClause } from "./where.js";

export interface UpdateQuery<
    TSchemaMap extends Record<string, DocumentRecord>,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    from: TSchemaName;
    set?: Partial<TSchemaMap[TSchemaName]>;
    where?: WhereClause<TSchemaMap[TSchemaName]>[];
}
