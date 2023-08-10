import { Effect, KeyOf } from "@ulthar/immuty";
import { Document } from "./types/document.js";
import { JoinResult } from "./types/join-result.js";
import { JoinableEffect } from "./effects/joinable-effect.js";

export interface Collection<
    TSchemaMap extends Record<string, Document> = Record<string, Document>,
    TSchema extends Document = Document,
    TName extends string = string,
> extends ReadableCollection<TSchemaMap, TSchema, TName>,
        WritableCollection<TSchema> {}

export interface ReadableCollection<
    TSchemaMap extends Record<string, Document> = Record<string, Document>,
    TSchema extends Document = Document,
    TName extends string = string,
> {
    selectAll(): Effect<void, TSchema[]>;

    leftJoin<OtherName extends KeyOf<TSchemaMap>>(
        name: OtherName
    ): JoinableEffect<
        TSchemaMap,
        JoinResult<TSchema, TName>,
        JoinResult<TSchemaMap[OtherName], OtherName>
    >;
}

export interface WritableCollection<TSchema extends Document = Document> {
    values(data: TSchema[]): Effect;
    value(data: TSchema): Effect;
}
