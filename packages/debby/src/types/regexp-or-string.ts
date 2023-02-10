export type RegExpOrString<T> = T extends string ? RegExp | T : never;
