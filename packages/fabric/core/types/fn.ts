// deno-lint-ignore-file no-explicit-any
/**
 * A function that takes an argument of type `T` and returns a value of type `R`.
 */
export type Fn<T = any, R = any> = (arg: T) => R;

/**
 * An action is a function that takes an argument of type `T` and returns nothing.
 */
export type Action<T> = Fn<T, void>;

/**
 * A `Singleton`
 * is function that takes no arguments and returns a value of type `T`.
 */
export type Singleton<T> = Fn<void, T>;
