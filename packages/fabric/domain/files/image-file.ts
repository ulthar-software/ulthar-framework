import type { ImageMimeType } from "./mime-type.ts";
import type { StoredFile } from "./stored-file.ts";

/**
 * Represents an image file.
 */
export interface ImageFile extends StoredFile {
  mimeType: ImageMimeType;
}
