import { Effect, KeyOf } from "@ulthar/immuty";
import { ConcatJoinResult } from "../types/concat-join-result.js";
import { JoinResult } from "../types/join-result.js";
import { JoinableEffect } from "./joinable-effect.js";
import { Document } from "../types/document.js";

export type JoinEffect<
    TSchemaMap extends Record<string, Document>,
    A extends JoinResult,
    B extends JoinResult,
> = {
    selectAll(): Effect<void, ConcatJoinResult<A, B>[]>;

    leftJoin<CSchema extends Document, CName extends KeyOf<TSchemaMap>>(
        name: CName
    ): JoinableEffect<
        TSchemaMap,
        ConcatJoinResult<A, B>,
        JoinResult<CSchema, CName>
    >;
};
