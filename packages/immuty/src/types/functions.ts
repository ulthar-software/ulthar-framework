/**
 * A function that takes an argument of type `A` and returns a value of type `B`.
 */
export type Fn<A, B> = (a: A) => B;

/**
 * A function that takes an argument of type `A` and returns nothing.
 */
export type Unit<A> = Fn<A, void>;

/**
 * A singleton is a function that returns the same value every time it is called.
 */
export type Singleton<A> = () => A;

/**
 * A predicate is a function that takes an argument of type `A` and returns a boolean.
 * It is generally used to test whether a value of type `A` satisfies some condition.
 */
export type Predicate<A> = Fn<A, boolean>;

/**
 *  It takes an argument of type `unknown` and returns a value of type `T`.
 */
export type Caster<T> = Fn<unknown, T>;

/**
 * An asyncFunction takes a value of type `A` and returns a value of type `B` wrapped
 * in a promise.
 */
export type AsyncFn<A, B> = Fn<A, Promise<B>>;

/**
 * An FnChain is a list of functions that can be composed together.
 * The first function takes an argument of type `A` and the chain returns a value of type `B`
 */
export type FnChain<A, B> =
    | [Fn<A, B>]
    | [Fn<A, any>, Fn<any, B>]
    | [Fn<A, any>, ...Fn<any, any>[], Fn<any, B>];

/**
 * A binary function takes two arguments of type `A` and `B` and returns a value of type `C`.
 */
export type BinaryFn<A, B, C> = (x: A, y: B) => C;

/**
 * Takes two arguments of type `A` and `B` and returns a value of type `C` wrapped in a promise.
 */
export type AsyncBinaryFn<A, B, C> = (x: A, y: B) => Promise<C>;

/**
 * Represents any function in javascript.
 */
export type AnyFunction = (...args: any[]) => any;
