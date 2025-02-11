export type OrderByOptions<T = any> = {
  [K in keyof T]?: "ASC" | "DESC";
};
