import { KeysMatching } from "./keys-matching.js";

export type FilterMatching<T, V> = {
    [K in KeysMatching<T, V>]: T[K];
};
