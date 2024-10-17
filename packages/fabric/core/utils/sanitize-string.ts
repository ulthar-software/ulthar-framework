import validator from "validator";
import { isUndefined } from "./is-nullish.ts";

const { stripLow, trim } = validator;

/**
 * Parses and sanitizes an unknown value into a string
 * The string is trimmed and all low characters are removed
 */
export function parseAndSanitizeString(value: unknown): string | undefined {
  if (isUndefined(value)) {
    return value;
  }
  return stripLow(trim(String(value)));
}
