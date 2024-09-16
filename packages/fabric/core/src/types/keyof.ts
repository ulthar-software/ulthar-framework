/**
 * Only string keys are allowed in the keyof type
 */
export type Keyof<T> = Extract<keyof T, string>;
