import { ImageMimeType } from "./mime-type.js";
import { StoredFile } from "./stored-file.js";

/**
 * Represents an image file.
 */
export interface ImageFile extends StoredFile {
  mimeType: ImageMimeType;
}
