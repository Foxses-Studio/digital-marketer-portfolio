import { PageHeader } from "@/components/admin/page-header";
import { SettingsTabs, type SettingsTab } from "@/components/admin/settings/settings-tabs";
import { routes } from "@/config/routes";
import { requireAdmin } from "@/lib/auth/dal";
import { hasPermission } from "@/lib/permissions";

export default async function SettingsLayout({ children }: LayoutProps<"/admin/settings">) {
  const admin = await requireAdmin();
  const tabs: SettingsTab[] = [
    { href: "/admin/settings", label: "General" },
    { href: "/admin/settings/branding", label: "Branding" },
    { href: "/admin/settings/social", label: "Social" },
    ...(hasPermission(admin.role, "seo:manage") ? [{ href: "/admin/settings/seo", label: "SEO" }] : []),
    ...(hasPermission(admin.role, "admins:manage") ? [{ href: routes.admin.admins, label: "Administrators" }] : []),
  ];
  return (
    <>
      <PageHeader title="Settings" description="Website details, branding and defaults." />
      <SettingsTabs tabs={tabs} />
      {children}
    </>
  );
}
