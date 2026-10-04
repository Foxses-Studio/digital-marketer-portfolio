import { getLocalStorage } from "@/lib/media/storage";
import { MEDIA_KEY_PATTERN } from "@/lib/media/storage/local";
import { MEDIA_TYPES } from "@/lib/media/types";

const CONTENT_TYPES = Object.fromEntries(
  Object.entries(MEDIA_TYPES).map(([mime, ext]) => [ext, mime]),
) as Record<string, string>;

/** Serves files from the local storage driver. Keys are random and immutable. */
export async function GET(_request: Request, { params }: RouteContext<"/media/[...key]">) {
  const key = (await params).key.join("/");
  const storage = getLocalStorage();
  if (!storage || !MEDIA_KEY_PATTERN.test(key)) return new Response(null, { status: 404 });

  try {
    const file = await storage.read(key);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[key.split(".").pop()!] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
