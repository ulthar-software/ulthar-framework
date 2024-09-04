import { ImageMimeType } from "../../../files/mime-type.js";
import { DomainFile } from "./domain-file.js";

/**
 * Represents an image file.
 */
export interface ImageFile extends DomainFile {
  mimeType: ImageMimeType;
}
