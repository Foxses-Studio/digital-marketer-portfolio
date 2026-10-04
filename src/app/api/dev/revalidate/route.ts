import { revalidateTag } from "next/cache";
import { PAGE_DEFINITIONS } from "@/config/pages";
import { cacheTags } from "@/lib/cms/cache-tags";
import { settingsSchemas } from "@/validation/settings";

/**
 * Development only: lets `npm run db:seed` refresh cached CMS reads in a
 * running `next dev`. Returns 404 in production and for non-local requests.
 */
export async function POST(request: Request) {
  const host = new URL(request.url).hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  if (process.env.NODE_ENV !== "development" || !local) {
    return new Response(null, { status: 404 });
  }
  const tags = [
    ...Object.keys(settingsSchemas).map(cacheTags.settings),
    ...Object.keys(PAGE_DEFINITIONS).map(cacheTags.page),
    cacheTags.media,
  ];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, tags });
}
