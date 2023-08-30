/**
 * Represents any function in javascript.
 */
export type SomeFunction<A = unknown, Args extends unknown[] = unknown[]> = (
    ...args: Args
) => A;
