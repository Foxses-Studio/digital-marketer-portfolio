import "server-only";
import { randomUUID } from "node:crypto";
import { imageSize } from "image-size";
import { ObjectId } from "mongodb";
import { collection } from "@/db";
import type { MediaDocument } from "@/db/schema";
import { env } from "@/lib/env";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { detectImageType } from "./sniff";
import { getStorage } from "./storage";
import { MEDIA_TYPES, type MediaItem } from "./types";

/**
 * The single upload pipeline used by every feature (profile photo,
 * covers, logos, screenshots...). Features store the returned media id.
 */

export function toMediaItem(doc: MediaDocument): MediaItem {
  return {
    id: doc._id.toHexString(),
    url: doc.url,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    width: doc.width,
    height: doc.height,
    alt: doc.alt,
    createdAt: doc.createdAt.toISOString(),
  };
}

function cleanFileName(name: string) {
  return name.replace(/[^\p{L}\p{N}._ -]/gu, "").trim().slice(0, 120) || "upload";
}

export async function uploadMedia(file: File, uploadedBy: string): Promise<MediaItem> {
  const maxBytes = env().MEDIA_MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size === 0) throw new ValidationError({ file: ["The file is empty."] });
  if (file.size > maxBytes) {
    throw new ValidationError({
      file: [`Files can be up to ${env().MEDIA_MAX_UPLOAD_MB} MB.`],
    });
  }

  const body = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectImageType(body);
  if (!mimeType) {
    throw new ValidationError({ file: ["Upload a JPG, PNG, WebP, AVIF or GIF image."] });
  }

  let width: number | null = null;
  let height: number | null = null;
  try {
    const size = imageSize(body);
    width = size.width ?? null;
    height = size.height ?? null;
  } catch {
    throw new ValidationError({ file: ["This image appears to be damaged."] });
  }

  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `${now.getUTCFullYear()}/${month}/${randomUUID()}.${MEDIA_TYPES[mimeType]}`;
  const storage = getStorage();
  await storage.put({ key, body, contentType: mimeType });

  const doc: MediaDocument = {
    _id: new ObjectId(),
    storage: storage.name,
    key,
    url: storage.url(key),
    originalName: cleanFileName(file.name),
    mimeType,
    size: body.byteLength,
    width,
    height,
    alt: "",
    uploadedBy: new ObjectId(uploadedBy),
    createdAt: now,
    updatedAt: now,
  };

  const media = await collection("media");
  try {
    await media.insertOne(doc);
  } catch (error) {
    await storage.delete(key).catch(() => {});
    throw error;
  }
  return toMediaItem(doc);
}

export async function listMedia({
  limit = 60,
  before,
}: { limit?: number; before?: string } = {}): Promise<MediaItem[]> {
  const media = await collection("media");
  const filter = before && ObjectId.isValid(before) ? { _id: { $lt: new ObjectId(before) } } : {};
  const docs = await media.find(filter).sort({ _id: -1 }).limit(Math.min(limit, 200)).toArray();
  return docs.map(toMediaItem);
}

export async function countMedia() {
  const media = await collection("media");
  return media.estimatedDocumentCount();
}

export async function updateMediaAlt(id: string, alt: string) {
  const media = await collection("media");
  const result = await media.updateOne(
    { _id: new ObjectId(id) },
    { $set: { alt, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) throw new NotFoundError("That file no longer exists.");
}

export async function deleteMedia(id: string) {
  const media = await collection("media");
  const doc = await media.findOneAndDelete({ _id: new ObjectId(id) });
  if (!doc) throw new NotFoundError("That file no longer exists.");
  // Database first: a leftover file is harmless, a dangling record isn't.
  await getStorage().delete(doc.key).catch((error) => {
    console.error("[media] could not delete file", doc.key, error);
  });
}

/** Loads media documents by id (unknown or invalid ids are skipped). */
export async function findMediaByIds(ids: Array<string | null | undefined>) {
  const valid = [...new Set(ids.filter((id): id is string => !!id && ObjectId.isValid(id)))];
  if (valid.length === 0) return new Map<string, MediaItem>();
  const media = await collection("media");
  const docs = await media.find({ _id: { $in: valid.map((id) => new ObjectId(id)) } }).toArray();
  return new Map(docs.map((doc) => [doc._id.toHexString(), toMediaItem(doc)]));
}
