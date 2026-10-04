import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { ObjectId } from "mongodb";
import sharp from "sharp";
import type { MediaDocument } from "../../../src/db/schema";
import { DEMO_MEDIA } from "../media-art";
import { applyUnit, type SeedContext } from "../ledger";

async function exists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Demo cover images: generated artwork written to local media storage and
 * registered in the media library (editable alt text, deletable). Files for
 * seeded media are re-created if missing, e.g. on a second machine sharing
 * the same database.
 */
export async function seedMedia(ctx: SeedContext) {
  if ((process.env.MEDIA_STORAGE_DRIVER || "local") !== "local") {
    console.log("  skipped: demo images need MEDIA_STORAGE_DRIVER=local");
    return;
  }
  const root = path.resolve(process.cwd(), process.env.MEDIA_LOCAL_DIR || "storage/uploads");
  const collection = ctx.db.collection<MediaDocument>("media");

  for (const item of DEMO_MEDIA) {
    const _id = new ObjectId(item.id);
    const file = path.join(root, item.key);
    const render = async () => {
      const body = await sharp(Buffer.from(item.svg())).webp({ quality: 86 }).toBuffer();
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body);
      return body.byteLength;
    };

    const doc = await collection.findOne({ _id });
    const status = await applyUnit(ctx, {
      key: `media:${item.id}`,
      current: doc ? { alt: doc.alt, originalName: doc.originalName } : undefined,
      next: { alt: item.alt, originalName: item.originalName },
      write: async (value) => {
        const size = await render();
        const now = new Date();
        await collection.updateOne(
          { _id },
          {
            $set: { ...value, size, updatedAt: now },
            $setOnInsert: {
              storage: "local",
              key: item.key,
              url: `/media/${item.key}`,
              mimeType: "image/webp",
              width: item.width,
              height: item.height,
              uploadedBy: null,
              createdAt: now,
            },
          },
          { upsert: true },
        );
      },
    });
    // Seeded media whose file is missing on this machine: restore the file.
    if (!ctx.dryRun && doc && status !== "kept-foreign" && !(await exists(file))) {
      await render();
      console.log(`  ${`file ${item.key}`.padEnd(52)} restored`);
    }
  }
}

/** Resolves "media:<ref>" placeholders in demo content to media ids. */
export function resolveMediaRefs<T>(value: T): T {
  const ids = new Map(DEMO_MEDIA.map((item) => [item.ref, item.id]));
  const walk = (input: unknown): unknown => {
    if (typeof input === "string" && input.startsWith("media:")) return ids.get(input) ?? null;
    if (Array.isArray(input)) return input.map(walk);
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.entries(input).map(([key, child]) => [key, walk(child)]));
    }
    return input;
  };
  return walk(value) as T;
}
