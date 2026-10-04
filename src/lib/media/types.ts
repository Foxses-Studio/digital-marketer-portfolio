/** Media types and limits shared by the upload UI and the server. */

/** Accepted upload formats. SVG is excluded on purpose: it can carry script. */
export const MEDIA_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
} as const;

export type MediaMimeType = keyof typeof MEDIA_TYPES;

export const MEDIA_ACCEPT = Object.keys(MEDIA_TYPES).join(",");

/** What the client receives for a media item (no internal fields). */
export type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
};
