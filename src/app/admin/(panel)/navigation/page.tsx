import type { Metadata } from "next";
import { HeaderSettingsForm } from "@/components/admin/navigation/header-settings-form";
import { NavItemsManager } from "@/components/admin/navigation/nav-items-manager";
import { PageHeader } from "@/components/admin/page-header";
import { FormSection } from "@/components/admin/settings/form-section";
import { requirePagePermission } from "@/lib/auth/dal";
import { readSettings } from "@/lib/cms/settings";
import { NAV_ITEM_LIMIT } from "@/validation/settings";

export const metadata: Metadata = { title: "Navigation" };

export default async function NavigationPage() {
  await requirePagePermission("settings:manage");
  const navigation = await readSettings("navigation");
  return (
    <>
      <PageHeader title="Navigation" description="The header menu and button on your public website." />
      <div className="border-b border-line pb-8">
        <FormSection title="Menu items" description="Shown in this order. Hidden items stay here but don't appear on the site.">
          <NavItemsManager items={navigation.items} limit={NAV_ITEM_LIMIT} />
        </FormSection>
      </div>
      <div className="pt-8">
        <HeaderSettingsForm values={navigation} />
      </div>
    </>
  );
}
