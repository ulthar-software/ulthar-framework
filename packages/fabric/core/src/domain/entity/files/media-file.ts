import { DomainFile } from "./domain-file.js";

/**
 * Represents a media file, either an image, a video or an audio file.
 */
export interface MediaFile extends DomainFile {
  mimeType: `image/${string}` | `video/${string}` | `audio/${string}`;
}
