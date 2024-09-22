import { StoredFile } from "../domain/entity/files/stored-file.js";

/**
 * Represents a media file, either an image, a video or an audio file.
 */
export interface MediaFile extends StoredFile {
  mimeType: `image/${string}` | `video/${string}` | `audio/${string}`;
}
