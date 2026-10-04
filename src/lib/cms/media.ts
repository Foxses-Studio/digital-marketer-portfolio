import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { findMediaByIds } from "@/lib/media/service";
import type { MediaItem } from "@/lib/media/types";
import { cacheTags } from "./cache-tags";

/** Cached media lookup for public sections. */
export async function getMediaMap(ids: Array<string | null | undefined>): Promise<Record<string, MediaItem>> {
  "use cache";
  cacheTag(cacheTags.media);
  cacheLife("max");
  return Object.fromEntries(await findMediaByIds(ids));
}
