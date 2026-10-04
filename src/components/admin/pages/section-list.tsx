"use client";

import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { reorderSections, setSectionEnabled } from "@/actions/pages";
import { reportResult } from "@/lib/feedback/alerts";
import { cn } from "@/lib/utils/cn";

type Section = { id: string; type: string; enabled: boolean; label: string; description: string };

/** Section order and visibility for one page; editing opens each section. */
export function SectionList({ page, sections: initial }: { page: string; sections: Section[] }) {
  const router = useRouter();
  const [sections, setSections] = useOptimistic(initial);
  const [pending, startTransition] = useTransition();

  function toggle(section: Section) {
    startTransition(async () => {
      setSections(sections.map((s) => (s.id === section.id ? { ...s, enabled: !s.enabled } : s)));
      await reportResult(await setSectionEnabled({ page, sectionId: section.id, enabled: !section.enabled }));
      router.refresh();
    });
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...sections];
    [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
    startTransition(async () => {
      setSections(next);
      await reportResult(await reorderSections({ page, order: next.map((s) => s.id) }));
      router.refresh();
    });
  }

  return (
    <ol aria-label="Sections" className={cn("divide-y divide-line rounded-md border border-line bg-surface", pending && "opacity-80")}>
      {sections.map((section, index) => (
        <li key={section.id} className="flex items-center gap-3 px-3 py-4 sm:px-5" data-section={section.type}>
          <div className="flex flex-col">
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || pending} aria-label={`Move ${section.label} up`} className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30">
              <ArrowUp className="size-3.5" aria-hidden />
            </button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === sections.length - 1 || pending} aria-label={`Move ${section.label} down`} className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30">
              <ArrowDown className="size-3.5" aria-hidden />
            </button>
          </div>
          <div className={cn("min-w-0 flex-1", !section.enabled && "opacity-50")}>
            <p className="text-small font-medium text-fg">{section.label}</p>
            <p className="text-[0.8125rem] text-fg-muted">{section.description}</p>
          </div>
          <label className="flex items-center gap-2 text-small text-fg-secondary">
            <span className="hidden sm:inline">{section.enabled ? "Shown" : "Hidden"}</span>
            <input
              type="checkbox"
              role="switch"
              checked={section.enabled}
              onChange={() => toggle(section)}
              aria-label={`Show ${section.label} section`}
              className="relative h-5 w-9 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface-muted transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-3 before:rounded-full before:bg-fg-muted before:transition-transform checked:border-button-primary checked:bg-button-primary checked:before:translate-x-4 checked:before:bg-button-primary-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
          </label>
          <Link
            href={`/admin/pages/${page}/${section.id}`}
            className="inline-flex h-8 items-center gap-1 rounded-sm border border-line-strong px-3 text-small font-medium text-fg hover:bg-hover"
          >
            Edit
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ol>
  );
}
