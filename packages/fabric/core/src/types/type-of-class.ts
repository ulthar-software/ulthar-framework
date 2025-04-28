import type { ClassConstructor } from "./class-constructor.js";

export type TypeOfClass<T> = T extends ClassConstructor<infer R> ? R : never;
