/**
 * Immutably updates an object with the provided update and returns the updated object.
 */
export function withUpdate<T extends object>(obj: T, update: Partial<T>): T {
  return {
    ...obj,
    ...update,
  };
}
