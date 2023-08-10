import { Effect, KeyOf } from "@ulthar/immuty";
import { Collection } from "../collection.js";
import { Document } from "../types/document.js";
import { JoinableEffect } from "../effects/joinable-effect.js";
import { JoinResult } from "../types/join-result.js";
import { InMemoryJoinableEffect } from "./in-memory-joinable-effect.js";
import { InMemoryStore } from "./in-memory-store.js";

export class InMemoryCollection<
    TSchemaMap extends Record<string, Document> = Record<string, Document>,
    TSchema extends Document = Document,
    TName extends string = string,
> implements Collection<TSchemaMap, TSchema, TName>
{
    private documents: TSchema[] = [];

    constructor(
        private store: InMemoryStore<TSchemaMap>,
        private name: TName
    ) {}

    selectAll(): Effect<void, TSchema[]> {
        return Effect.fromSync(() => this.documents);
    }

    leftJoin<OtherName extends KeyOf<TSchemaMap>>(
        name: OtherName
    ): JoinableEffect<
        TSchemaMap,
        JoinResult<TSchema, TName>,
        JoinResult<TSchemaMap[OtherName], OtherName>
    > {
        return new InMemoryJoinableEffect(this.store, name, this.selectAll());
    }

    values(data: TSchema[]): Effect {
        return Effect.fromSync(() => {
            this.documents.push(...data);
        });
    }

    value(data: TSchema): Effect {
        return Effect.fromSync(() => {
            this.documents.push(data);
        });
    }
}
