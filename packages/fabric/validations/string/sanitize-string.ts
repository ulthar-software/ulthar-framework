import { isNullish } from "../nullish/is-nullish.ts";

/**
 * Parses and sanitizes an unknown value into a string
 * The string is trimmed and all low characters are removed
 */
export function parseAndSanitizeString(
  value: unknown,
): string | undefined {
  if (isNullish(value) || typeof value != "string") return undefined;
  return stripLow(value).trim();
}

// deno-lint-ignore no-control-regex
const lowCharsRegex = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g;

const stripLow = (str: string) => str.replace(lowCharsRegex, "");
