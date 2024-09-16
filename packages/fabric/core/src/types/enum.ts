export type EnumToValues<T extends Record<string, string>> = T[keyof T];
