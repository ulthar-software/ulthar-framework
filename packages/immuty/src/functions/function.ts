/**
 * Represents any function in javascript.
 */
export type SomeFunction<A = unknown> = (...args: unknown[]) => A;
