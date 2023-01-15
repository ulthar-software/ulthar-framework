/**
 * Defines a type that may or may not be a Promise wrapped around T
 */
export type MaybePromise<T> = Promise<T> | T;
