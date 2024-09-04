import { MimeType } from "./mime-type.js";

/**
 * Checks if the actual file type is the same as the expected mime type.
 */
export function isMimeType<T extends MimeType>(
  expectedMimeType: T,
  actualMimeType: string,
): actualMimeType is T {
  return actualMimeType.match("^" + expectedMimeType + "$") !== null;
}
