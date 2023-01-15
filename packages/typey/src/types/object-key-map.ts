export type ObjectKeyMap<K, U> = K extends string ? { [key in K]: U } : never;
