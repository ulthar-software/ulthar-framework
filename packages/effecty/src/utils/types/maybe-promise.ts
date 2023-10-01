export type MaybePromise<T> = T | Promise<T>;

export type ResolveMaybePromise<MaybePromise, T> =
    MaybePromise extends Promise<unknown> ? Promise<T> : T;
