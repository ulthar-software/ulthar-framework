import { KeyOf } from "@ulthar/immuty";
import { JoinResult } from "../types/join-result.js";
import { JoinEffect } from "./join-effect.js";
import { Document } from "../types/document.js";

export interface JoinableEffect<
    TSchemaMap extends Record<string, Document>,
    A extends JoinResult,
    B extends JoinResult,
> {
    on(condition: OnCondition<A, B>): JoinEffect<TSchemaMap, A, B>;
}

export type OnCondition<A, B> = {
    [K in KeyOf<A>]: KeyOf<A[K]>;
} & {
    [K in KeyOf<B>]: KeyOf<B[K]>;
};
