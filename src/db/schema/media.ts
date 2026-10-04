import type { ObjectId } from "mongodb";
import type { CollectionIndexes } from "./types";

/**
 * Every uploaded file (profile photo, covers, screenshots, logos...). Other
 * entities reference media by `_id`; the file itself lives in the storage
 * driver configured by MEDIA_STORAGE_DRIVER.
 */
export type MediaDocument = {
  _id: ObjectId;
  /** Storage driver that holds the file, e.g. "local". */
  storage: string;
  /** Path of the file inside the storage driver. */
  key: string;
  /** Public URL used to display the file. */
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  uploadedBy: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mediaIndexes: CollectionIndexes = [
  { key: { key: 1 }, name: "key_unique", unique: true },
  { key: { createdAt: -1 }, name: "newest" },
];
