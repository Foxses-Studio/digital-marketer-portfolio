import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/config/social";
import { findMediaByIds } from "@/lib/media/service";
import { cacheTags } from "./cache-tags";
import { getSettings } from "./settings";

/**
 * Public, render-ready site data. Everything here is cached and refreshed
 * by the admin actions through cache tags, so public pages stay static
 * until content changes. Only data that should be public leaves here.
 */

export type BrandImage = { url: string; width: number; height: number; alt: string };

export type Brand = {
  /** Text brand: professional name, falling back to the website name. */
  name: string;
  siteName: string;
  title: string;
  logo: BrandImage | null;
  darkLogo: BrandImage | null;
};

export type PublicNavItem = { id: string; label: string; url: string; newTab: boolean };

export type HeaderData = {
  brand: Brand;
  items: PublicNavItem[];
  cta: { label: string; url: string; newTab: boolean } | null;
  sticky: boolean;
  hideOnScroll: boolean;
};

export type SocialLink = { platform: SocialPlatform; label: string; url: string };

export async function getBrand(): Promise<Brand> {
  "use cache";
  cacheTag(cacheTags.settings("site"), cacheTags.settings("branding"), cacheTags.media);
  cacheLife("max");

  const [site, branding] = await Promise.all([getSettings("site"), getSettings("branding")]);
  const media = await findMediaByIds([branding.logoMediaId, branding.darkLogoMediaId]);
  const name = site.professionalName || site.siteName;

  const image = (id: string | null): BrandImage | null => {
    const item = id ? media.get(id) : undefined;
    if (!item?.width || !item.height) return null;
    return { url: item.url, width: item.width, height: item.height, alt: name };
  };

  const logo = image(branding.logoMediaId);
  return {
    name,
    siteName: site.siteName,
    title: site.professionalTitle,
    logo,
    // A dark logo only makes sense alongside a main logo.
    darkLogo: logo ? image(branding.darkLogoMediaId) : null,
  };
}

export async function getHeaderData(): Promise<HeaderData> {
  "use cache";
  cacheTag(cacheTags.settings("navigation"));
  cacheLife("max");

  const [brand, navigation] = await Promise.all([getBrand(), getSettings("navigation")]);
  const { cta } = navigation;
  return {
    brand,
    items: navigation.items
      .filter((item) => item.enabled)
      .map(({ id, label, url, newTab }) => ({ id, label, url, newTab })),
    cta: cta.enabled && cta.label && cta.url ? { label: cta.label, url: cta.url, newTab: cta.newTab } : null,
    sticky: navigation.sticky,
    hideOnScroll: navigation.sticky && navigation.hideOnScroll,
  };
}

/** Enabled social links with a URL, in platform order. */
export async function getSocialLinks(): Promise<SocialLink[]> {
  "use cache";
  cacheTag(cacheTags.settings("social"));
  cacheLife("max");

  const social = await getSettings("social");
  return SOCIAL_PLATFORMS.flatMap(({ key, label }) => {
    const link = social[key];
    if (!link.enabled || !link.url) return [];
    return [{ platform: key, label: key === "website" && link.label ? link.label : label, url: link.url }];
  });
}

/** Contact details the admin chose to show. */
export async function getContactDetails() {
  "use cache";
  cacheTag(cacheTags.settings("site"));
  cacheLife("max");

  const site = await getSettings("site");
  return {
    email: site.contactEmail || null,
    phone: site.showPhone && site.phone ? site.phone : null,
    location: site.showLocation && site.location ? site.location : null,
  };
}

/** Favicon and default social image URLs for metadata. */
export async function getMetadataAssets() {
  "use cache";
  cacheTag(cacheTags.settings("branding"), cacheTags.settings("seo"), cacheTags.media);
  cacheLife("max");

  const [branding, seo] = await Promise.all([getSettings("branding"), getSettings("seo")]);
  const media = await findMediaByIds([branding.faviconMediaId, seo.defaultOgImageMediaId]);
  const favicon = branding.faviconMediaId ? media.get(branding.faviconMediaId) : undefined;
  const ogImage = seo.defaultOgImageMediaId ? media.get(seo.defaultOgImageMediaId) : undefined;
  return {
    favicon: favicon ? { url: favicon.url, type: favicon.mimeType } : null,
    ogImage: ogImage
      ? { url: ogImage.url, width: ogImage.width ?? undefined, height: ogImage.height ?? undefined }
      : null,
  };
}

export type FooterData = {
  brand: Brand;
  description: string;
  copyright: string;
  items: PublicNavItem[];
  social: SocialLink[];
  contact: { email: string | null; phone: string | null; location: string | null };
};

/** Footer content: footer settings plus the shared brand, navigation and links. */
export async function getFooterData(): Promise<FooterData> {
  "use cache";
  cacheTag(cacheTags.settings("footer"), cacheTags.settings("navigation"), cacheTags.settings("social"), cacheTags.settings("site"));
  // Revalidated daily so "{year}" rolls over on its own.
  cacheLife("days");

  const [footer, header, social, contact] = await Promise.all([
    getSettings("footer"),
    getHeaderData(),
    getSocialLinks(),
    getContactDetails(),
  ]);
  const year = String(new Date().getFullYear());
  const copyright = (footer.copyright || `© {year} ${header.brand.name}`).replaceAll("{year}", year);
  return {
    brand: header.brand,
    description: footer.description,
    copyright,
    items: footer.showNavigation ? header.items : [],
    social: footer.showSocial ? social : [],
    contact,
  };
}
