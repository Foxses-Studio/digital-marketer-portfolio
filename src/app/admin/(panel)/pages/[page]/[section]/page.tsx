import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroEditor } from "@/components/admin/pages/hero-editor";
import { isPageKey, PAGE_DEFINITIONS } from "@/config/pages";
import { requirePagePermission } from "@/lib/auth/dal";
import { getPageForAdmin } from "@/lib/cms/pages";
import { getSectionDefinition } from "@/lib/cms/sections/registry";
import { findMediaByIds } from "@/lib/media/service";
import { heroContentSchema } from "@/sections/hero/definition";

export const metadata: Metadata = { title: "Edit section" };

export default async function SectionEditorPage({ params }: PageProps<"/admin/pages/[page]/[section]">) {
  const { page, section: sectionId } = await params;
  if (!isPageKey(page)) notFound();
  await requirePagePermission("content:manage");

  const doc = await getPageForAdmin(page);
  const section = doc.sections.find((s) => s.id === sectionId);
  const definition = section && getSectionDefinition(section.type);
  if (!section || !definition) notFound();

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
          previewPath={PAGE_DEFINITIONS[page].path}
        />
      </>
    );
  }

  notFound();
}
