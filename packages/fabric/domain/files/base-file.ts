import type { MimeType } from "./mime-type.ts";

/**
 * Represents a file. Its the base type for all files.
 */
export interface BaseFile {
  name: string;
  sizeInBytes: number;
  mimeType: MimeType;
}
