import { SectionIntro } from "@/components/site/section-intro";
import { formatMetric } from "@/lib/metrics";
import { chartGeometry } from "../hero/chart-geometry";
import { MetricValue } from "../hero/metric-value";
import { SectionMotion } from "../motion/section-motion";
import type { ResultsContent } from "../defs";
import type { SectionProps } from "./types";

/**
 * Results as a data story. Desktop with motion: the stage pins and each
 * result takes the stage in turn while the trend line draws (scrubbed,
 * normal scroll speed). Elsewhere: an editorial grid that counts up.
 */
export function ResultsSection({ content, index, id }: SectionProps<ResultsContent>) {
  const metrics = content.metrics.filter((metric) => metric.enabled);
  if (!metrics.length && !content.heading) return null;
  const chart = content.chartPoints.length >= 2 ? chartGeometry(content.chartPoints) : null;
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="results" labelledBy={content.heading ? headingId : undefined} className="section-space overflow-x-clip">
      <div className="container-wide">
        <SectionIntro id={headingId} index={index} label={content.label} heading={content.heading} highlight={content.highlight} description={content.description} />

        <div data-results-stage className="results-stage mt-14 lg:mt-20">
          <div className="results-body grid gap-x-[clamp(3rem,6vw,7rem)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <ol data-results-slides className="results-slides grid border-t border-line sm:grid-cols-2">
              {metrics.map((metric, i) => (
                <li
                  key={metric.id}
                  data-result-slide
                  data-hide
                  className="results-slide flex flex-col border-b border-line py-8 sm:odd:pr-8 sm:even:border-l sm:even:pl-8"
                >
                  <p className="flex items-center gap-3 text-label text-fg-muted">
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span>{metric.label}</span>
                  </p>
                  <MetricValue metric={metric} className="results-value mt-5 block text-fg" />
                  {metric.note && <p className="results-note mt-4 max-w-[30rem] text-body text-fg-secondary">{metric.note}</p>}
                </li>
              ))}
            </ol>

            <ol data-results-index aria-hidden className="results-index hidden">
              {metrics.map((metric, i) => (
                <li key={metric.id} data-result-tab className="results-tab relative grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 py-4">
                  <span className="text-label tabular-nums text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-body font-medium text-fg">{metric.label}</span>
                  <span className="font-mono text-small tabular-nums text-fg-secondary">{formatMetric(metric)}</span>
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
                  <span data-result-bar aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent" />
                </li>
              ))}
            </ol>
          </div>

          {(chart || content.footnote) && (
            <figure data-hide className="results-chart mt-10 lg:mt-14">
              {chart && (
                <div className="relative">
                  {content.chartLabel && (
                    <figcaption className="mb-3 flex items-center gap-2 text-label text-fg-muted">
                      <span aria-hidden className="h-px w-5 bg-accent" />
                      {content.chartLabel}
                    </figcaption>
                  )}
                  <div data-results-line className="relative h-[clamp(5rem,12vw,9rem)]">
                    <svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full overflow-visible">
                      <defs>
                        <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.16" />
                          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={chart.area} fill={`url(#${id}-fill)`} />
                      <path d={chart.line} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <span
                      data-results-dot
                      aria-hidden
                      className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent-subtle"
                      style={{ left: "100%", top: `${(chart.points.at(-1)![1] / 200) * 100}%` }}
                    />
                  </div>
                  <div aria-hidden className="mt-2 h-px bg-line" />
                </div>
              )}
              {content.footnote && <p className="mt-4 max-w-[48rem] text-small text-fg-muted">{content.footnote}</p>}
            </figure>
          )}
        </div>
      </div>
    </SectionMotion>
  );
}
