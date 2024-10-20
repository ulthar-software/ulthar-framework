/**
 * Checks if a value is a number even if it is a string that can be converted to a number
 */
export function isNumber(value: unknown): value is number {
  if (typeof value === "number") {
    return !isNaN(value);
  }
  return false;
}
