import { SomeRecord, KeyOf } from "@ulthar/effecty";
import { JoinWhereClause } from "./where.js";
import { DocumentAggregators } from "../aggregators.js";

export type SelectQuery<TSchemaMap extends Record<string, SomeRecord>> = {
    from: KeyOf<TSchemaMap>;
    joins?: JoinWrapper<TSchemaMap>[];
    select?: {
        [K in string]?: string[];
    };
    aggregates?: {
        [K in string]?: DocumentAggregators<string, string>[];
    };
    where?: JoinWhereClause[];
    groupBy?: {
        [K in string]?: string[];
    };
};

export type JoinWrapper<TSchemaMap extends Record<string, SomeRecord>> = {
    type: "left" | "inner" | "right" | "full";
    from: KeyOf<TSchemaMap>;
    as: string;
    on: {
        [K in string]?: string;
    };
};
