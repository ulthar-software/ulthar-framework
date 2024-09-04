import { MimeType } from "./mime-type.js";

/**
 * Represents a file. Its the base type for all files.
 */
export interface BaseFile {
  name: string;
  sizeInBytes: number;
  mimeType: MimeType;
}
