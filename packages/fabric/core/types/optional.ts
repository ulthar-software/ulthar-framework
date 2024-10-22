/**
 * `Nothing` is a type that represents the absence of a value.
 * In JavaScript, `undefined` represents that a value was not defined
 * and `null` represents the absence of a value, but `Nothing` is a type that
 * can be used to represent the absence of a value in a more explicit way.
 */
export type Nothing = null;
export const Nothing = null;

/**
 * An `Optional` type is a type that represents a value that may or may not be present.
 */
export type Optional<T> = T | Nothing;
