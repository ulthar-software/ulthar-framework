import { isNullish } from "./is-nullish.ts";
import { parseAndSanitizeString } from "./sanitize-string.ts";

export function isNotANumber(value: unknown): boolean {
  if (isNullish(value)) {
    return true;
  }

  if (typeof value === "string") {
    const sanitized = parseAndSanitizeString(value);
    if (sanitized === "") {
      return true;
    }
  }

  if (
    typeof value === "boolean" ||
    typeof value === "object" ||
    Array.isArray(value)
  ) {
    return true;
  }

  return isNaN(Number(value));
}
