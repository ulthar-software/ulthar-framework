export type EnumToType<T extends Record<string, string>> = T[keyof T];
