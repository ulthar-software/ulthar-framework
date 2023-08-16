import { DocumentRecord, KeyOf } from "@ulthar/immuty";
import { JoinWhereClause } from "./where.js";

export type SelectQueryWrapper<
    TSchemaMap extends Record<string, DocumentRecord>,
> = {
    from: KeyOf<TSchemaMap>;
    joins?: JoinWrapper<TSchemaMap>[];
    select?: {
        [K in string]?: string[];
    };
    where?: JoinWhereClause[];
};

export type JoinWrapper<TSchemaMap extends Record<string, DocumentRecord>> = {
    type: "left" | "inner" | "right" | "full";
    from: KeyOf<TSchemaMap>;
    as: string;
    on: {
        [K in string]?: string;
    };
};
