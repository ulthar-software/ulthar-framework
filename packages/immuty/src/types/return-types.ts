import { Fn } from "../functions/unary.js";

export type ReturnTypesOfMethodsInObject<T> = {
    [K in keyof T]: T[K] extends Fn<unknown, infer R> ? R : never;
}[keyof T];
