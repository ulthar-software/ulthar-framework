/**
 * Defines the type of the class given an instance type T
 */
export type ClassOfType<T> = new (...args: any[]) => T;
