/**
 * Infers the type of a property K in type T
 */
export type TypeofProperty<T, K extends keyof T> = T[K];
