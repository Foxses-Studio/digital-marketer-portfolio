import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandingSettingsForm } from "@/components/admin/settings/branding-form";
import { SeoSettingsForm } from "@/components/admin/settings/seo-form";
import { SocialSettingsForm } from "@/components/admin/settings/social-form";
import { requirePagePermission } from "@/lib/auth/dal";
import { readSettings } from "@/lib/cms/settings";
import { findMediaByIds } from "@/lib/media/service";

const TABS = {
  branding: { title: "Branding", permission: "settings:manage" },
  social: { title: "Social links", permission: "settings:manage" },
  seo: { title: "SEO defaults", permission: "seo:manage" },
} as const;

type Tab = keyof typeof TABS;
const isTab = (value: string): value is Tab => Object.hasOwn(TABS, value);

export async function generateMetadata({ params }: PageProps<"/admin/settings/[tab]">): Promise<Metadata> {
  const { tab } = await params;
  return { title: isTab(tab) ? TABS[tab].title : "Not found" };
}

export default async function SettingsTabPage({ params }: PageProps<"/admin/settings/[tab]">) {
  const { tab } = await params;
  if (!isTab(tab)) notFound();
  await requirePagePermission(TABS[tab].permission);

  if (tab === "branding") {
    const branding = await readSettings("branding");
    const media = await findMediaByIds([branding.logoMediaId, branding.darkLogoMediaId, branding.faviconMediaId]);
    const pick = (id: string | null) => (id ? media.get(id) ?? null : null);
    return (
      <BrandingSettingsForm
        logo={pick(branding.logoMediaId)}
        darkLogo={pick(branding.darkLogoMediaId)}
        favicon={pick(branding.faviconMediaId)}
      />
    );
  }

  if (tab === "seo") {
    const seo = await readSettings("seo");
    const media = await findMediaByIds([seo.defaultOgImageMediaId]);
    return <SeoSettingsForm values={seo} ogImage={seo.defaultOgImageMediaId ? media.get(seo.defaultOgImageMediaId) ?? null : null} />;
  }

  return <SocialSettingsForm values={await readSettings("social")} />;
}
