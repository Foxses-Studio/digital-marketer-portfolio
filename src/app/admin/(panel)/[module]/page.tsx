import { Construction } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { plannedModules } from "@/config/admin-nav";
import { requirePagePermission } from "@/lib/auth/dal";

/**
 * Placeholder for admin modules that aren't built yet. A real module gets
 * its own folder (e.g. app/admin/(panel)/projects), which takes precedence
 * over this dynamic route.
 */
export async function generateMetadata({ params }: PageProps<"/admin/[module]">): Promise<Metadata> {
  const item = plannedModules.get((await params).module);
  return { title: item?.label ?? "Not found" };
}

export default async function PlannedModulePage({ params }: PageProps<"/admin/[module]">) {
  const item = plannedModules.get((await params).module);
  if (!item) notFound();
  await requirePagePermission(item.permission);

  return (
    <>
      <PageHeader title={item.label} description={item.description} />
      <EmptyState
        icon={Construction}
        title="Not built yet"
        description="This module will be added in a later step."
      />
    </>
  );
}
