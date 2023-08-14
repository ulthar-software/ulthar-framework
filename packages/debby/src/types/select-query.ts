import { KeyOf } from "@ulthar/immuty";
import { Document } from "./document.js";
import { WhereClause } from "./where.js";

export type SelectQueryWrapper<TSchemaMap extends Record<string, Document>> = {
    from: KeyOf<TSchemaMap>;
    joins?: JoinWrapper<TSchemaMap>[];
    select?: {
        [K in string]?: string[];
    };
    where?: WhereClause<Document>[];
};

export type JoinWrapper<TSchemaMap extends Record<string, Document>> = {
    type: "left" | "inner" | "right" | "full";
    from: KeyOf<TSchemaMap>;
    as: string;
    on: {
        [K in string]?: string;
    };
};
