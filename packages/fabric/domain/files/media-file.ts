import type { StoredFile } from "./stored-file.ts";

/**
 * Represents a media file, either an image, a video or an audio file.
 */
export interface MediaFile extends StoredFile {
  mimeType: `image/${string}` | `video/${string}` | `audio/${string}`;
}
