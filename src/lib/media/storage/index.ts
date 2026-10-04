import "server-only";
import { env } from "@/lib/env";
import { createLocalDriver } from "./local";
import type { StorageDriver } from "./types";

let driver: ReturnType<typeof createLocalDriver> | undefined;

/** The storage driver selected by MEDIA_STORAGE_DRIVER. */
export function getStorage(): StorageDriver {
  const { MEDIA_STORAGE_DRIVER, MEDIA_LOCAL_DIR } = env();
  switch (MEDIA_STORAGE_DRIVER) {
    case "local":
      return (driver ??= createLocalDriver(MEDIA_LOCAL_DIR));
  }
}

/** The local driver, when it is the active one (for the file-serving route). */
export function getLocalStorage() {
  const { MEDIA_STORAGE_DRIVER, MEDIA_LOCAL_DIR } = env();
  if (MEDIA_STORAGE_DRIVER !== "local") return null;
  return (driver ??= createLocalDriver(MEDIA_LOCAL_DIR));
}

export type { StorageDriver } from "./types";
