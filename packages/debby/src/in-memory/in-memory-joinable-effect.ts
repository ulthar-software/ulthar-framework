import { Effect, KeyOf } from "@ulthar/immuty";
import { JoinEffect } from "../effects/join-effect.js";
import { JoinableEffect } from "../effects/joinable-effect.js";
import { Document } from "../types/document.js";
import { JoinResult } from "../types/join-result.js";
import { InMemoryStore } from "./in-memory-store.js";

export class InMemoryJoinableEffect<
    TSchemaMap extends Record<string, Document>,
    A extends JoinResult,
    B extends JoinResult,
> implements JoinableEffect<TSchemaMap, A, B>
{
    constructor(
        private readonly store: InMemoryStore<TSchemaMap>,
        private readonly name: KeyOf<TSchemaMap>,
        private readonly effect: Effect<void, A[]>
    ) {}

    on() // condition: OnCondition<A, B>
    : JoinEffect<TSchemaMap, A, B> {
        throw new Error("Method not implemented.");
    }
}
