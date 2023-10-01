import { DocumentRecord, KeyOf } from "@ulthar/effecty";
import { WhereClause } from "./where.js";

export interface DeleteQuery<
    TSchemaMap extends Record<string, DocumentRecord>,
    TSchemaName extends KeyOf<TSchemaMap>,
> {
    from: TSchemaName;
    where?: WhereClause<TSchemaMap[TSchemaName]>[];
}
