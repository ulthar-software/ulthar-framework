/**
 * Infers the instance type given the class type T
 */
export type TypeofClass<T> = T extends new (...args: any[]) => infer ClassType
    ? ClassType
    : never;
