export type TypeOfArrayItems<T> = T extends Array<infer K> ? K : never;
