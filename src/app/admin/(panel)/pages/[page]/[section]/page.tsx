import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityManager } from "@/components/admin/content/entity-manager";
import { SectionEditor } from "@/components/admin/content/section-editor";
import { FormSection } from "@/components/admin/settings/form-section";
import { HeroEditor } from "@/components/admin/pages/hero-editor";
import { isPageKey, PAGE_DEFINITIONS } from "@/config/pages";
import { requirePagePermission } from "@/lib/auth/dal";
import { getPageForAdmin } from "@/lib/cms/pages";
import { getSectionDefinition } from "@/lib/cms/sections/registry";
import { collectMediaIds } from "@/lib/content/fields";
import { getEntityDefinition } from "@/lib/entities/registry";
import { listEntries } from "@/lib/entities/service";
import { findMediaByIds } from "@/lib/media/service";
import type { MediaItem } from "@/lib/media/types";
import { heroContentSchema } from "@/sections/hero/definition";

export const metadata: Metadata = { title: "Edit section" };

async function mediaMap(ids: string[]): Promise<Record<string, MediaItem>> {
  return Object.fromEntries(await findMediaByIds(ids));
}

export default async function SectionEditorPage({ params }: PageProps<"/admin/pages/[page]/[section]">) {
  const { page, section: sectionId } = await params;
  if (!isPageKey(page)) notFound();
  await requirePagePermission("content:manage");

  const doc = await getPageForAdmin(page);
  const section = doc.sections.find((s) => s.id === sectionId);
  const definition = section && getSectionDefinition(section.type);
  if (!section || !definition) notFound();
  const previewPath = PAGE_DEFINITIONS[page].path;

  const back = (
    <Link href={`/admin/pages/${page}`} className="text-small text-fg-muted hover:text-fg">
      {PAGE_DEFINITIONS[page].title}
    </Link>
  );

  if (section.type === "hero") {
    const parsed = heroContentSchema.safeParse(section.content);
    const content = parsed.success ? parsed.data : heroContentSchema.parse({});
    const media = content.imageMediaId ? await findMediaByIds([content.imageMediaId]) : new Map();
    return (
      <>
        {back}
        <HeroEditor
          page={page}
          sectionId={section.id}
          enabled={section.enabled}
          initial={content}
          image={content.imageMediaId ? media.get(content.imageMediaId) ?? null : null}
          previewPath={previewPath}
        />
      </>
    );
  }

  const parsed = definition.content.safeParse(section.content);
  const content = parsed.success ? parsed.data : definition.content.parse({});
  const fields = (definition.fields ?? []).flatMap((group) => group.fields);
  const entity = definition.entity;
  const entries = entity ? await listEntries(entity) : [];
  const media = await mediaMap([
    ...collectMediaIds(fields, content),
    ...(entity ? entries.flatMap((entry) => collectMediaIds(getEntityDefinition(entity).fields, entry)) : []),
  ]);

  return (
    <>
      {back}
      <SectionEditor
        page={page}
        sectionId={section.id}
        type={section.type}
        enabled={section.enabled}
        initial={content}
        media={media}
        previewPath={previewPath}
      >
        {entity && (
          <div className="mt-10">
            <FormSection
              stacked
              title={getEntityDefinition(entity).label}
              description={`Changes here save immediately and also appear wherever ${getEntityDefinition(entity).label.toLowerCase()} are shown.`}
            >
              <EntityManager type={entity} items={entries} media={media} />
            </FormSection>
          </div>
        )}
      </SectionEditor>
    </>
  );
}
