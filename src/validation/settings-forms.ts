import type { z } from "zod";
import { SOCIAL_PLATFORMS } from "@/config/social";
import { headerSettingsSchema, settingsSchemas, type FormSettingsGroup } from "./settings";

/**
 * Turns an admin settings form into the object its schema validates.
 * Shared by the browser (instant validation) and the Server Action
 * (authoritative validation), so both read the form the same way.
 * Field names use dots for nesting, e.g. "linkedin.url", "cta.label".
 */

const text = (fd: FormData, name: string) => {
  const value = fd.get(name);
  return typeof value === "string" ? value : "";
};
const checked = (fd: FormData, name: string) => fd.get(name) === "on";
const media = (fd: FormData, name: string) => text(fd, name) || null;

const parsers: Record<FormSettingsGroup, (fd: FormData) => unknown> = {
  site: (fd) => ({
    siteName: text(fd, "siteName"),
    professionalName: text(fd, "professionalName"),
    professionalTitle: text(fd, "professionalTitle"),
    siteUrl: text(fd, "siteUrl"),
    contactEmail: text(fd, "contactEmail"),
    phone: text(fd, "phone"),
    showPhone: checked(fd, "showPhone"),
    location: text(fd, "location"),
    showLocation: checked(fd, "showLocation"),
  }),
  branding: (fd) => ({
    logoMediaId: media(fd, "logoMediaId"),
    darkLogoMediaId: media(fd, "darkLogoMediaId"),
    faviconMediaId: media(fd, "faviconMediaId"),
  }),
  social: (fd) =>
    Object.fromEntries(
      SOCIAL_PLATFORMS.map(({ key }) => [
        key,
        { enabled: checked(fd, `${key}.enabled`), url: text(fd, `${key}.url`), label: text(fd, `${key}.label`) },
      ]),
    ),
  seo: (fd) => ({
    defaultTitle: text(fd, "defaultTitle"),
    titleTemplate: text(fd, "titleTemplate"),
    defaultDescription: text(fd, "defaultDescription"),
    defaultOgImageMediaId: media(fd, "defaultOgImageMediaId"),
  }),
  header: (fd) => ({
    cta: {
      enabled: checked(fd, "cta.enabled"),
      label: text(fd, "cta.label"),
      url: text(fd, "cta.url"),
      newTab: checked(fd, "cta.newTab"),
    },
    sticky: checked(fd, "sticky"),
    hideOnScroll: checked(fd, "hideOnScroll"),
  }),
};

export const settingsFormSchemas = {
  site: settingsSchemas.site,
  branding: settingsSchemas.branding,
  social: settingsSchemas.social,
  seo: settingsSchemas.seo,
  header: headerSettingsSchema,
} satisfies Record<FormSettingsGroup, z.ZodType>;

export function parseSettingsForm(group: FormSettingsGroup, formData: FormData): unknown {
  return parsers[group](formData);
}
