import { MimeType } from "./mime-type.js";

/**
 * Checks if the actual file type is the same as the expected mime type.
 */
export function isMimeType<T extends MimeType>(
  expectedMimeType: T,
  actualFileType: string,
): actualFileType is T {
  return actualFileType.match("^" + expectedMimeType + "$") !== null;
}
