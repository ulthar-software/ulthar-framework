/**
 * `Nothing` is a type that represents the absence of a value.
 * In JavaScript, `undefined` represents that a value was not defined
 * and `null` represents the absence of a value, but `Nothing` is a type that
 * can be used to represent the absence of a value in a more explicit way.
 */
export type Nothing = null;
export const Nothing = null;

/**
 * Un Optional es un tipo que puede ser un valor o no ser nada.
 */
export type Optional<T> = T | Nothing;
