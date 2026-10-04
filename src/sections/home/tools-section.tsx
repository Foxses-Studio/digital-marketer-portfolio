import { SectionIntro } from "@/components/site/section-intro";
import { getPublicEntries } from "@/lib/entities/service";
import { TOOL_CATEGORY_LABELS } from "@/lib/entities/registry";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import type { SectionProps } from "./types";

/**
 * Tools grouped by category, set as large type. On large screens each row
 * drifts horizontally with scroll (alternating directions) so long rows
 * reveal themselves; on small screens rows wrap.
 */
export async function ToolsSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const tools = await getPublicEntries("tools");
  if (!tools.length) return null;
  const groups = Object.entries(TOOL_CATEGORY_LABELS)
    .map(([key, label]) => ({ key, label, tools: tools.filter((tool) => tool.category === key) }))
    .filter((group) => group.tools.length);
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="tools" labelledBy={content.heading ? headingId : undefined} className="section-space overflow-x-clip bg-surface">
      <div className="container-wide">
        <SectionIntro id={headingId} index={index} label={content.label} heading={content.heading} highlight={content.highlight} description={content.description} />
      </div>
      <div className="container-wide mt-14 lg:mt-20">
        <ul className="border-t border-line">
          {groups.map((group) => (
            <li key={group.key} data-tools-row className="grid gap-4 border-b border-line py-7 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center lg:gap-10 lg:py-9">
              <h3 className="text-label text-fg-muted">
                {group.label}
                <span className="ml-2 tabular-nums text-fg-muted/70">{String(group.tools.length).padStart(2, "0")}</span>
              </h3>
              <div data-tools-viewport className="min-w-0 lg:overflow-hidden">
                <ul data-tools-track className="flex flex-wrap items-baseline gap-x-6 gap-y-3 lg:w-max lg:flex-nowrap lg:gap-x-10">
                  {group.tools.map((tool) => (
                    <li key={tool.id} className="group/tool flex items-baseline gap-2 whitespace-nowrap">
                      <span className="font-display text-[clamp(1.375rem,1rem+1.6vw,2.5rem)] leading-tight font-semibold tracking-[-0.035em] text-fg-secondary transition-colors duration-300 group-hover/tool:text-fg">
                        {String(tool.name ?? "")}
                      </span>
                      {Boolean(tool.note) && <span className="text-label text-fg-muted">{String(tool.note)}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionMotion>
  );
}
