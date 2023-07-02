export type KeysMatching<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type FilterKeysMatching<T, V> = {
    [K in KeysMatching<T, V>]: T[K];
};
