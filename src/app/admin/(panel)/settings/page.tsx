import type { Metadata } from "next";
import { GeneralSettingsForm } from "@/components/admin/settings/general-form";
import { requirePagePermission } from "@/lib/auth/dal";
import { readSettings } from "@/lib/cms/settings";

export const metadata: Metadata = { title: "General settings" };

export default async function GeneralSettingsPage() {
  await requirePagePermission("settings:manage");
  return <GeneralSettingsForm values={await readSettings("site")} />;
}
