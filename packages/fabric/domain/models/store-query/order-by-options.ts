export type OrderByOptions<T> = {
  [K in keyof T]?: "ASC" | "DESC";
};
