import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver } from "./types";

/**
 * Stores files on the server's disk (default: storage/uploads, outside
 * /public) and serves them through the /media/[...key] route. Suitable for
 * development and single-server hosting with a persistent disk. Not for
 * serverless platforms, whose disk is temporary.
 */
export const MEDIA_KEY_PATTERN = /^\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|avif|gif)$/;

export function createLocalDriver(directory: string): StorageDriver & {
  read(key: string): Promise<Buffer>;
} {
  // Runtime directory chosen by env; exclude it from build file tracing.
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), directory);

  function resolveKey(key: string) {
    if (!MEDIA_KEY_PATTERN.test(key)) throw new Error("Invalid media key.");
    const full = path.resolve(root, key);
    if (!full.startsWith(root + path.sep)) throw new Error("Invalid media key.");
    return full;
  }

  return {
    name: "local",
    async put({ key, body }) {
      const file = resolveKey(key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body, { flag: "wx" });
    },
    async delete(key) {
      await rm(resolveKey(key), { force: true });
    },
    url(key) {
      return `/media/${key}`;
    },
    read(key) {
      return readFile(resolveKey(key));
    },
  };
}
