/**
 * Returns the number of milliseconds.
 *
 * This is a no-op function that is used to
 * make the code more explicit and readable.
 */
export const ms = (n: number) => n;

/**
 * Converts a number of seconds to milliseconds.
 */
export const seconds = (n: number) => n * 1000;

/**
 * Converts a number of minutes to milliseconds.
 */
export const minutes = (n: number) => n * 60 * 1000;

/**
 * Converts a number of hours to milliseconds.
 */
export const hours = (n: number) => n * 60 * 60 * 1000;
