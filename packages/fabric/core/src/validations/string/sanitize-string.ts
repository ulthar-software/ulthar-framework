import { isNullish } from "../nullish/is-nullish.js";

/**
 * Parses and sanitizes an unknown value into a string
 * The string is trimmed and all low characters are removed
 */
export function parseAndSanitizeString(value: unknown): string | undefined {
  if (isNullish(value) || typeof value != "string") return undefined;
  return stripLow(value).trim();
}

// eslint-disable-next-line no-control-regex -- We need control characters to be stripped
const lowCharsRegex = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g;

const stripLow = (str: string) => str.replace(lowCharsRegex, "");
