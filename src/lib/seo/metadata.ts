import type { Metadata } from "next";
import type { SeoFields } from "@/validation/seo";
import type { Settings } from "@/validation/settings";

/**
 * Builds the root metadata from global settings. Page-level metadata from
 * `buildEntryMetadata` is merged on top of this by Next.js.
 */
export function buildRootMetadata(
  site: Settings<"site">,
  seo: Settings<"seo">,
): Metadata {
  const baseUrl = site.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const description = seo.defaultDescription || undefined;
  const images = seo.defaultOgImage ? [seo.defaultOgImage] : undefined;

  return {
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    applicationName: site.siteName,
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description,
    openGraph: {
      type: "website",
      siteName: site.siteName,
      title: seo.defaultTitle,
      description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: seo.defaultTitle,
      description,
      images,
    },
  };
}

type EntryMetadataInput = {
  /** The entry's own SEO overrides from the CMS. */
  seo?: Partial<SeoFields> | null;
  /** Fallbacks taken from the entry's content (title, excerpt, cover). */
  fallback: { title: string; description?: string; image?: string };
  /** Path of the entry, used as the canonical URL when none is set. */
  path: string;
  type?: "website" | "article";
};

/** Metadata for a single page, project, case study or blog post. */
export function buildEntryMetadata({
  seo,
  fallback,
  path,
  type = "website",
}: EntryMetadataInput): Metadata {
  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const image = seo?.ogImage || fallback.image;
  const images = image ? [image] : undefined;

  return {
    title,
    description,
    alternates: { canonical: seo?.canonicalUrl || path },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { type, title, description, url: path, images },
    twitter: { title, description, images },
  };
}
