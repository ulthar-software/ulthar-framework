import { RegExpOrString } from "./regexp-or-string.js";

export type AlternativeType<T> = T extends ReadonlyArray<infer U>
    ? T | RegExpOrString<U>
    : RegExpOrString<T> | T;
