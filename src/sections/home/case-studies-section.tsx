import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/site/action-link";
import { CoverArt } from "@/components/site/cover-art";
import { SectionIntro } from "@/components/site/section-intro";
import { getMediaMap } from "@/lib/cms/media";
import { getPublicEntries } from "@/lib/entities/service";
import { formatMetric, type MetricParts } from "@/lib/metrics";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import type { SectionProps } from "./types";

type Metric = MetricParts & { id: string; label: string };

/**
 * Featured case studies: the first dark chapter. Desktop with motion: the
 * stage pins and the studies replace each other (cover wipes, copy
 * crossfades, progress ticks) as you scroll. Elsewhere: stacked cards.
 */
export async function CaseStudiesSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const limit = Number(content.limit) || 3;
  let entries = await getPublicEntries("caseStudies", { limit, filter: { featured: true } });
  if (!entries.length) entries = await getPublicEntries("caseStudies", { limit });
  if (!entries.length) return null;
  const media = await getMediaMap(entries.map((entry) => entry.coverMediaId as string | null));
  const headingId = `${id}-heading`;
  const total = String(entries.length).padStart(2, "0");

  return (
    <SectionMotion variant="caseStudies" tone="feature" labelledBy={content.heading ? headingId : undefined} className="text-feature-fg">
      <div data-feature-bg aria-hidden className="absolute inset-0 bg-feature" />
      <div className="relative section-space">
        <div className="container-wide">
          <SectionIntro
            id={headingId}
            tone="feature"
            index={index}
            label={content.label}
            heading={content.heading}
            highlight={content.highlight}
            description={content.description}
            aside={content.cta.enabled ? <ButtonLink cta={content.cta} tone="feature" /> : undefined}
          />
        </div>

        <div data-cases-stage className="cases-stage container-wide mt-14 lg:mt-20">
          <div className="cases-progress hidden" aria-hidden>
            <span className="text-label tabular-nums text-feature-muted">
              <span data-cases-current>01</span> / {total}
            </span>
            <span className="flex flex-1 gap-1.5">
              {entries.map((entry) => (
                <span key={entry.id} className="relative h-px flex-1 bg-feature-fg/15">
                  <span data-cases-tick className="absolute inset-0 origin-left scale-x-0 bg-accent" />
                </span>
              ))}
            </span>
          </div>

          <ol className="cases-list grid gap-16 sm:gap-20">
            {entries.map((entry, i) => {
              const metrics = (Array.isArray(entry.metrics) ? entry.metrics : []) as Metric[];
              const title = String(entry.title ?? "");
              const href = `/case-studies/${String(entry.slug ?? "")}`;
              const cover = entry.coverMediaId ? media[entry.coverMediaId as string] ?? null : null;
              return (
                <li key={entry.id} data-case className="cases-item grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-[clamp(3rem,6vw,6rem)]">
                  <div data-case-copy className="cases-copy order-2 lg:order-1">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-feature-muted">
                      <span className="tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span>{String(entry.client ?? "")}</span>
                      {Boolean(entry.industry) && <span aria-hidden>·</span>}
                      {Boolean(entry.industry) && <span>{String(entry.industry)}</span>}
                      <span aria-hidden>·</span>
                      <span>{String(entry.year ?? "")}</span>
                    </p>
                    <h3 className="mt-5 text-h2 text-feature-fg">
                      <Link href={href} className="transition-colors duration-300 hover:text-accent">
                        {title}
                      </Link>
                    </h3>
                    {Boolean(entry.challenge || entry.result) && (
                      <dl className="mt-6 grid gap-4 text-body text-feature-muted">
                        {Boolean(entry.challenge) && (
                          <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                            <dt className="pt-1 text-label">Challenge</dt>
                            <dd>{String(entry.challenge)}</dd>
                          </div>
                        )}
                        {Boolean(entry.result) && (
                          <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                            <dt className="pt-1 text-label">Result</dt>
                            <dd className="text-feature-fg">{String(entry.result)}</dd>
                          </div>
                        )}
                      </dl>
                    )}
                    {metrics.length > 0 && (
                      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-feature-fg/15 pt-6 sm:grid-cols-3">
                        {metrics.slice(0, 3).map((metric) => (
                          <li key={metric.id}>
                            <span className="block font-display text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] leading-none font-semibold tracking-[-0.045em] text-feature-fg tabular-nums">
                              {formatMetric(metric)}
                            </span>
                            <span className="mt-2 block text-small text-feature-muted">{metric.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={href} className="group/case mt-8 inline-flex h-11 items-center gap-2 text-[0.9375rem] font-medium text-feature-fg">
                      Read the case study<span className="sr-only">: {title}</span>
                      <ArrowUpRight aria-hidden className="size-4 text-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/case:translate-x-0.5 group-hover/case:-translate-y-0.5" />
                    </Link>
                  </div>
                  <Link href={href} tabIndex={-1} aria-hidden className="cases-cover order-1 block lg:order-2">
                    <div data-case-cover className="cases-cover-frame relative aspect-[4/3] overflow-hidden rounded-xs">
                      <CoverArt
                        image={cover}
                        style={String(entry.coverStyle ?? "ink")}
                        label={String(entry.client ?? "")}
                        sizes="(min-width: 64rem) 52vw, 92vw"
                                imageClassName="cases-cover-image"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </SectionMotion>
  );
}
