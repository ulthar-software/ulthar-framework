export type ArrayType<T> = T extends (infer U)[] ? U : never;
