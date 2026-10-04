import { TextLink } from "@/components/site/action-link";
import { SectionIntro } from "@/components/site/section-intro";
import { getPublicEntries } from "@/lib/entities/service";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import type { SectionProps } from "./types";

/**
 * Experience as an editorial timeline. A progress line runs down the left;
 * the role nearest the reading line is emphasized while the others recede.
 */
export async function ExperienceSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const roles = await getPublicEntries("experience");
  if (!roles.length) return null;
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="experience" labelledBy={content.heading ? headingId : undefined} className="section-space">
      <div className="container-wide grid gap-x-[clamp(3rem,6vw,7rem)] gap-y-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="lg:sticky lg:top-[calc(var(--header-height)+3rem)] lg:self-start">
          <SectionIntro id={headingId} index={index} label={content.label} heading={content.heading} highlight={content.highlight} description={content.description} />
          {content.cta.enabled && (
            <div data-fade className="mt-8">
              <TextLink cta={content.cta} />
            </div>
          )}
        </div>

        <ol data-timeline className="relative">
          <span aria-hidden className="absolute top-0 bottom-0 left-0 w-px bg-line" />
          <span data-timeline-fill aria-hidden className="absolute top-0 bottom-0 left-0 w-px origin-top bg-accent" />
          {roles.map((role, i) => (
            <li key={role.id} data-timeline-item className="timeline-item relative grid gap-3 py-9 pl-8 first:pt-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-8 sm:pl-10">
              <span aria-hidden className={`timeline-node absolute left-0 size-[7px] -translate-x-[3px] rounded-full bg-line-strong ${i === 0 ? "top-2" : "top-10.5"}`} />
              <div>
                <p className="font-mono text-small tabular-nums text-fg-secondary">{String(role.period ?? "")}</p>
                {Boolean(role.location) && <p className="mt-1 text-small text-fg-muted">{String(role.location)}</p>}
              </div>
              <div>
                <h3 className="text-h3 text-fg">{String(role.role ?? "")}</h3>
                <p className="mt-1 text-body font-medium text-fg-secondary">{String(role.company ?? "")}</p>
                {Boolean(role.description) && <p className="mt-4 max-w-[40rem] text-body text-fg-secondary">{String(role.description)}</p>}
                {Boolean(role.achievement) && (
                  <p className="mt-5 flex gap-3 border-l-2 border-accent pl-4 text-body text-fg">{String(role.achievement)}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionMotion>
  );
}
