import { DomainFile } from "./domain-file.js";
import { ImageMimeType } from "./mime-type.js";

/**
 * Represents an image file.
 */
export interface ImageFile extends DomainFile {
  mimeType: ImageMimeType;
}
