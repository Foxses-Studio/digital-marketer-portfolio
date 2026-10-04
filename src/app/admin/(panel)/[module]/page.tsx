import { Construction } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityManager } from "@/components/admin/content/entity-manager";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { adminNav, plannedModules } from "@/config/admin-nav";
import { requirePagePermission } from "@/lib/auth/dal";
import { collectMediaIds } from "@/lib/content/fields";
import { entityByAdminPath, getEntityDefinition } from "@/lib/entities/registry";
import { listEntries } from "@/lib/entities/service";
import { findMediaByIds } from "@/lib/media/service";

/**
 * Admin modules without their own folder: collection managers (services,
 * case studies, blog...) and placeholders for modules not built yet.
 */
function resolve(module: string) {
  const href = `/admin/${module}`;
  const item = adminNav.flatMap((group) => group.items).find((i) => i.href === href);
  const entity = entityByAdminPath.get(href);
  return { item, entity, planned: plannedModules.get(module) };
}

export async function generateMetadata({ params }: PageProps<"/admin/[module]">): Promise<Metadata> {
  const { item } = resolve((await params).module);
  return { title: item?.label ?? "Not found" };
}

export default async function ModulePage({ params }: PageProps<"/admin/[module]">) {
  const { item, entity, planned } = resolve((await params).module);
  if (!item || (!entity && !planned)) notFound();
  await requirePagePermission(item.permission);

  if (entity) {
    const entries = await listEntries(entity);
    const definition = getEntityDefinition(entity);
    const media = Object.fromEntries(
      await findMediaByIds(entries.flatMap((entry) => collectMediaIds(definition.fields, entry))),
    );
    return (
      <>
        <PageHeader title={item.label} description={item.description} />
        <EntityManager type={entity} items={entries} media={media} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={item.label} description={item.description} />
      <EmptyState icon={Construction} title="Not built yet" description="This module will be added in a later step." />
    </>
  );
}
