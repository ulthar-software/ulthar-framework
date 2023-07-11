import { Fn } from "../functions/unary.js";

export type ReturnTypesOfMethodsInObject<T> = {
    [K in keyof T]: T[K] extends Fn<any, infer R> ? R : never;
}[keyof T];
