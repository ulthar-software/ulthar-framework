export type MimeType = `${string}/${string}`;

export const ImageMimeType = `image/.*` as `image/${string}`;
export type ImageMimeType = typeof ImageMimeType;

export const VideoMimeType = `video/.*` as `video/${string}`;
export type VideoMimeType = typeof VideoMimeType;

export const AudioMimeType = `audio/.*` as `audio/${string}`;
export type AudioMimeType = typeof AudioMimeType;

export const PdfMimeType = `application/pdf` as `application/pdf`;
export type PdfMimeType = typeof PdfMimeType;
