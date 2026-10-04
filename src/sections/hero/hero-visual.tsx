import Image from "next/image";
import type { MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";
import { growthParts, type ChartGeometry } from "./chart-geometry";
import type { HeroMetric } from "./definition";
import { HeroChart } from "./hero-chart";
import { MetricValue } from "./metric-value";

type Chart = { label: string; startLabel: string; endLabel: string; geometry: ChartGeometry };

/**
 * The marketing-performance composition. An anchor on the left (portrait,
 * or a performance panel when there's no portrait), a data plane behind it
 * on the right whose rising curve stays visible, and a foreground plate.
 *
 * Every layer has three wrappers so motion systems never fight over the
 * same transform: [data-scroll-speed] (scroll parallax) → [data-depth]
 * (pointer depth) → [data-reveal] (entrance).
 */
export function HeroVisual({
  image,
  imageAlt,
  monogram,
  caption,
  status,
  channels,
  featured,
  ledger,
  chart,
}: {
  image: MediaItem | null;
  imageAlt: string;
  monogram: string;
  caption: string;
  status: string;
  channels: string[];
  featured: HeroMetric | null;
  ledger: HeroMetric[];
  chart: Chart;
}) {
  const growth = chart.geometry.growth;
  const period = [chart.startLabel, chart.endLabel].filter(Boolean).join("–");
  const chartCaption = [chart.label, period].filter(Boolean).join(" · ");
  // With a portrait, the plate features the top result; without one, the
  // panel features it and the plate shows the graph's growth instead.
  const plate = image
    ? featured && { label: featured.label, metric: featured, caption: "" }
    : growth !== null && {
        label: period ? `Growth · ${period}` : "Growth",
        metric: growthParts(growth),
        caption: chart.label,
      };
  // The plane names the graph and its growth only when the plate isn't
  // already showing them.
  const plateShowsGrowth = !image && growth !== null;

  return (
    <div
      data-hero-visual
      className="relative mx-auto aspect-[1/0.92] w-full max-w-[40rem] sm:aspect-[1/1] lg:mr-0 lg:aspect-[1/1.02] lg:w-[min(100%,calc((100svh-var(--header-height)-5.5rem)/1.02))] lg:max-w-none"
    >
      {/* Data plane */}
      <div data-scroll-speed="-50" className="absolute top-[12%] right-0 h-[80%] w-[80%] sm:h-[62%] lg:top-[11%] lg:h-[64%] lg:w-[78%]">
        <div data-depth="5" className="relative h-full">
          {status && (
            <p
              data-reveal-fade
              className="absolute -top-3.5 right-4 z-10 flex items-center gap-2 rounded-full border border-line bg-elevated px-3 py-1.5 text-label text-fg-secondary shadow-sm sm:right-6"
            >
              <span aria-hidden className="hero-status relative size-1.5 rounded-full bg-accent-2" />
              {status}
            </p>
          )}
          <div
            data-reveal="plane"
            className="relative h-full overflow-hidden rounded-md border border-line bg-surface shadow-[0_1px_0_var(--color-shadow)]"
          >
            {/* Content sits in the part of the plane the anchor doesn't cover. */}
            <div className="absolute inset-y-0 right-0 left-[38%] flex flex-col px-4 pt-4 sm:px-6 sm:pt-5 lg:left-[37%]">
              <div data-reveal-fade className="flex items-start justify-between gap-3">
                {caption && <p className="text-label text-fg-muted">{caption}</p>}
                {growth !== null && !plateShowsGrowth && (
                  <p className="shrink-0 text-label text-accent tabular-nums">{`${growthParts(growth).prefix}${growthParts(growth).value}%`}</p>
                )}
              </div>
              {channels.length > 0 && (
                <p data-reveal-fade className="mt-2 hidden flex-wrap gap-x-3 gap-y-1 text-label text-fg-muted/80 sm:flex">
                  {channels.map((channel, index) => (
                    <span key={`${channel}-${index}`}>{channel}</span>
                  ))}
                </p>
              )}
              {chartCaption && !plateShowsGrowth && (
                <p data-reveal-fade className="mt-1 text-[0.8125rem] text-fg-secondary">
                  {chartCaption}
                </p>
              )}

              {ledger.length > 0 && (
                <dl className="relative z-10 mt-5 hidden lg:block">
                  {ledger.map((metric) => (
                    <div
                      key={metric.id}
                      data-ledger-row
                      className="flex items-baseline justify-between gap-4 border-t border-line bg-surface py-2.5"
                    >
                      <dt className="truncate text-small text-fg-muted">{metric.label}</dt>
                      <dd className="text-[clamp(1.05rem,0.8rem+0.5vw,1.3rem)] leading-none font-semibold tracking-[-0.025em] text-fg">
                        <MetricValue metric={metric} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div data-scroll-speed="20" className="absolute inset-x-0 bottom-0 h-[56%] lg:h-[40%]">
              <div data-depth="9" className="relative h-full">
                <HeroChart geometry={chart.geometry} className="h-full w-full overflow-visible" />
                <span
                  data-chart-end
                  aria-hidden
                  className="absolute -mt-[5px] -ml-[5px] size-2.5 rounded-full border-2 border-accent bg-surface"
                  style={{
                    left: `${(chart.geometry.points.at(-1)![0] / 400) * 100}%`,
                    top: `${(chart.geometry.points.at(-1)![1] / 200) * 100}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Anchor: portrait, or the performance panel */}
      <div data-scroll-speed="-110" className="absolute top-0 left-0 h-full w-[52%] sm:h-[76%] lg:h-[78%] lg:w-[50%]">
        <div data-depth="11" className="h-full">
          <div data-reveal="portrait" className="relative h-full overflow-hidden rounded-md">
            {image ? (
              <div data-hero-image className="absolute inset-0 bg-surface-muted">
                <Image
                  src={image.url}
                  alt={imageAlt}
                  fill
                  preload
                  sizes="(min-width: 1024px) 28vw, 52vw"
                  className="object-cover object-[50%_20%]"
                />
              </div>
            ) : (
              <PerformancePanel featured={featured} monogram={monogram} bars={chart.geometry.bars} chart={chart} />
            )}
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-black/5 ring-inset dark:ring-white/8" />
          </div>
        </div>
      </div>

      {/* Foreground plate */}
      {plate && (
        <div data-scroll-speed="-170" className="absolute bottom-0 left-[30%] hidden w-[46%] sm:block lg:left-[32%] lg:w-[42%]">
          <div data-depth="18">
            <div data-reveal="plate" className="rounded-md border border-line bg-elevated p-5 shadow-lg sm:p-6">
              <p className="text-label text-fg-muted">{plate.label}</p>
              <p className="mt-3 text-[clamp(2.25rem,1.5rem+2.2vw,3.5rem)] leading-[0.9] font-semibold tracking-[-0.045em] text-fg">
                <MetricValue metric={plate.metric} />
              </p>
              {plate.caption && <p className="mt-2 text-small text-fg-secondary">{plate.caption}</p>}
              <div aria-hidden className="mt-5 h-px w-full bg-line">
                <div data-plate-bar className="h-px w-2/3 origin-left bg-accent" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Shown in place of a portrait: the featured result on a dark panel with
 * the graph's values as bars. Finished on its own, replaced automatically
 * when a portrait is uploaded.
 */
function PerformancePanel({
  featured,
  monogram,
  bars,
  chart,
}: {
  featured: HeroMetric | null;
  monogram: string;
  bars: number[];
  chart: Chart;
}) {
  return (
    <div data-hero-image className="absolute inset-0 flex flex-col bg-feature p-[9%] text-feature-fg">
      {featured ? (
        <div>
          <p className="text-label text-feature-muted">{featured.label}</p>
          <p className="mt-3 text-[clamp(3rem,1.6rem+4.4vw,6rem)] leading-[0.85] font-semibold tracking-[-0.055em]">
            <MetricValue metric={featured} />
          </p>
        </div>
      ) : (
        <span aria-hidden className="font-serif text-[clamp(4rem,9vw,8rem)] leading-none text-feature-muted">
          {monogram}
        </span>
      )}

      <div aria-hidden className="mt-auto flex flex-1 flex-col justify-end pt-6">
        <div className="flex min-h-20 flex-1 items-end gap-[4%]" style={{ maxHeight: "62%" }}>
          {bars.map((height, index) => (
            <span
              key={index}
              data-bar
              className={cn(
                "flex-1 origin-bottom rounded-t-[2px]",
                index === bars.length - 1 ? "bg-accent" : "bg-feature-fg/16",
              )}
              style={{ height: `${Math.max(6, height * 100)}%` }}
            />
          ))}
        </div>
        {(chart.startLabel || chart.endLabel) && (
          <p className="mt-3 border-t border-feature-fg/12 pt-3 text-label text-feature-muted">
            {[chart.startLabel, chart.endLabel].filter(Boolean).join(" – ")}
          </p>
        )}
      </div>
    </div>
  );
}

export type LedgerItem = Pick<HeroMetric, "id" | "label" | "prefix" | "value" | "suffix"> & {
  /** Shown only on phones (where the foreground plate is hidden). */
  phoneOnly?: boolean;
};

/** Results below the visual on small screens. */
export function HeroLedgerMobile({ ledger }: { ledger: LedgerItem[] }) {
  if (ledger.length === 0) return null;
  const tabletCount = ledger.filter((item) => !item.phoneOnly).length;
  return (
    <dl className={cn("mt-10 grid grid-cols-2 gap-x-6 border-t border-line lg:hidden", tabletCount % 3 === 0 && "sm:grid-cols-3")}>
      {ledger.map((metric) => (
        <div key={metric.id} data-ledger-row className={cn("border-b border-line py-4", metric.phoneOnly && "sm:hidden")}>
          <dt className="text-small text-fg-muted">{metric.label}</dt>
          <dd className="mt-1.5 text-[1.5rem] leading-none font-semibold tracking-[-0.03em] text-fg">
            <MetricValue metric={metric} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
