import { Effect, KeyOf } from "@ulthar/immuty";
import { JoinEffect } from "../effects/join-effect.js";
import { JoinableEffect } from "../effects/joinable-effect.js";
import { ConcatJoinResult } from "../types/concat-join-result.js";
import { Document } from "../types/document.js";
import { JoinResult } from "../types/join-result.js";

export class InMemoryJoinEffect<
    TSchemaMap extends Record<string, Document>,
    A extends JoinResult,
    B extends JoinResult,
> implements JoinEffect<TSchemaMap, A, B>
{
    selectAll(): Effect<void, ConcatJoinResult<A, B>[]> {
        throw new Error("Method not implemented.");
    }

    leftJoin<
        CSchema extends Document,
        CName extends KeyOf<TSchemaMap>,
    >(): JoinableEffect< // name: CName
        TSchemaMap,
        ConcatJoinResult<A, B>,
        JoinResult<CSchema, CName>
    > {
        throw new Error("Method not implemented.");
    }
}
