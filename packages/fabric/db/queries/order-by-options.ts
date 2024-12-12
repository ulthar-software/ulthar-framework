// deno-lint-ignore-file no-explicit-any
export type OrderByOptions<T = any> = {
  [K in keyof T]?: "ASC" | "DESC";
};
