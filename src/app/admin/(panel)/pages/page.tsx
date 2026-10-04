import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { PAGE_DEFINITIONS, type PageKey } from "@/config/pages";
import { requirePagePermission } from "@/lib/auth/dal";
import { getSectionDefinition } from "@/lib/cms/sections/registry";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage() {
  await requirePagePermission("content:manage");
  const pages = Object.entries(PAGE_DEFINITIONS) as Array<[PageKey, (typeof PAGE_DEFINITIONS)[PageKey]]>;
  return (
    <>
      <PageHeader title="Pages" description="Edit the content of each page's sections. Layout and design stay consistent." />
      <ul className="divide-y divide-line rounded-md border border-line bg-surface">
        {pages.map(([key, page]) => {
          const sections = page.sections.map((type) => getSectionDefinition(type)?.label ?? type);
          return (
            <li key={key}>
              {sections.length > 0 ? (
                <Link href={`/admin/pages/${key}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-hover">
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-medium text-fg">{page.title}</p>
                    <p className="truncate text-[0.8125rem] text-fg-muted">
                      {page.path} · {sections.join(", ")}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-fg-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-medium text-fg-secondary">{page.title}</p>
                    <p className="text-[0.8125rem] text-fg-muted">{page.path} · Sections not built yet</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
