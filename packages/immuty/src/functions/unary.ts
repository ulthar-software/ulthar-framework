/**
 * A function that takes arguments of type `TArgs` and returns a value of type `A`.
 */
export type Fn<TArgs extends unknown[], A> = (...args: TArgs) => A;
