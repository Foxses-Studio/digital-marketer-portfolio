import type { MediaItem } from "@/lib/media/types";

/** Client helper for the single upload endpoint used by every feature. */
export async function uploadFile(
  file: File,
): Promise<{ ok: true; data: MediaItem } | { ok: false; error: string }> {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const json = await response.json().catch(() => null);
    if (response.ok && json?.ok) return { ok: true, data: json.data as MediaItem };
    const fieldError = json?.fieldErrors?.file?.[0];
    return { ok: false, error: fieldError ?? json?.error ?? "Upload failed. Please try again." };
  } catch {
    return { ok: false, error: "Upload failed. Check your connection and try again." };
  }
}
