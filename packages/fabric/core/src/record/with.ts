export function withUpdate<T extends Record<string, unknown>>(
  obj: T,
  update: Partial<T>,
): T {
  return {
    ...obj,
    ...update,
  };
}
