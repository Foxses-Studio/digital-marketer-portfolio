import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { SectionList } from "@/components/admin/pages/section-list";
import { isPageKey, PAGE_DEFINITIONS } from "@/config/pages";
import { requirePagePermission } from "@/lib/auth/dal";
import { getPageForAdmin } from "@/lib/cms/pages";
import { getSectionDefinition } from "@/lib/cms/sections/registry";

export async function generateMetadata({ params }: PageProps<"/admin/pages/[page]">): Promise<Metadata> {
  const { page } = await params;
  return { title: isPageKey(page) ? `${PAGE_DEFINITIONS[page].title} page` : "Not found" };
}

export default async function PageSectionsPage({ params }: PageProps<"/admin/pages/[page]">) {
  const { page } = await params;
  if (!isPageKey(page)) notFound();
  await requirePagePermission("content:manage");
  const doc = await getPageForAdmin(page);
  const sections = doc.sections.map((section) => ({
    id: section.id,
    type: section.type,
    enabled: section.enabled,
    label: getSectionDefinition(section.type)?.label ?? section.type,
    description: getSectionDefinition(section.type)?.description ?? "",
  }));

  return (
    <>
      <Link href="/admin/pages" className="text-small text-fg-muted hover:text-fg">
        Pages
      </Link>
      <PageHeader
        title={PAGE_DEFINITIONS[page].title}
        description="Sections appear on the page in this order. Hidden sections keep their content."
      />
      <SectionList page={page} sections={sections} />
    </>
  );
}
