import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";
import type { HeroMetric } from "./definition";
import { HeroChart } from "./hero-chart";
import { MetricValue } from "./metric-value";

/**
 * The "marketing performance" composition: a data plane with the campaign
 * curve, the portrait as anchor, a featured result in the foreground and a
 * ledger of supporting results. Each layer has three wrappers so motion
 * systems never fight over the same transform:
 *   [data-scroll-speed]  scroll parallax (y)
 *   [data-depth]         pointer depth (x/y)
 *   [data-reveal]        entrance
 */
export function HeroVisual({
  image,
  imageAlt,
  monogram,
  label,
  channels,
  featured,
  ledger,
}: {
  image: MediaItem | null;
  imageAlt: string;
  monogram: string;
  label: string;
  channels: string[];
  featured: HeroMetric | null;
  ledger: HeroMetric[];
}) {
  return (
    <div data-hero-visual className="relative mx-auto aspect-[1/1.2] w-full max-w-[40rem] sm:aspect-[1/1.06] lg:mr-0 lg:w-[min(100%,calc((100svh-var(--header-height)-5.5rem)/1.06))] lg:max-w-none">
      {/* Data plane: label, channels, ledger and the curve. */}
      <div data-scroll-speed="-50" className="absolute top-[10%] left-0 h-[56%] w-[84%] sm:top-[13%] sm:h-[60%] lg:top-[11%] lg:h-[63%] lg:w-[80%]">
        <div data-depth="5" className="h-full">
          <div
            data-reveal="plane"
            className="relative h-full overflow-hidden rounded-md border border-line bg-surface shadow-[0_1px_0_var(--color-shadow)]"
          >
            <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-5">
              {label ? (
                <p data-reveal-fade className="max-w-[44%] text-label text-fg-muted lg:max-w-[58%]">{label}</p>
              ) : (
                <span />
              )}
            </div>

            {ledger.length > 0 && (
              <dl className="absolute top-[17%] left-6 z-10 hidden w-[36%] lg:block">
                {ledger.map((metric) => (
                  <div key={metric.id} data-ledger-row className="border-t border-line bg-surface py-2.5 first:border-t-0 first:pt-0">
                    <dt className="text-small text-fg-muted">{metric.label}</dt>
                    <dd className="mt-1 text-[clamp(1.2rem,0.85rem+0.65vw,1.5rem)] leading-none font-semibold tracking-[-0.03em] text-fg">
                      <MetricValue metric={metric} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div data-scroll-speed="22" className="absolute inset-x-0 bottom-0 h-[64%] lg:h-[42%]">
              <div data-depth="9" className="h-full">
                <HeroChart className="h-full w-full overflow-visible" />
              </div>
            </div>

            {channels.length > 0 && (
              <p data-reveal-fade className="absolute bottom-3 left-6 hidden max-w-[45%] flex-wrap gap-x-3 gap-y-1 text-label text-fg-muted sm:flex">
                {channels.map((channel, index) => (
                  <span key={`${channel}-${index}`}>{channel}</span>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Portrait: the anchor. */}
      <div data-scroll-speed="-110" className="absolute top-0 right-0 h-[74%] w-[50%] sm:h-[84%] lg:h-[86%] lg:w-[52%]">
        <div data-depth="11" className="h-full">
          <div data-reveal="portrait" className="relative h-full overflow-hidden rounded-md bg-surface-muted">
            <div data-hero-image className="absolute inset-0">
              {image ? (
                <Image
                  src={image.url}
                  alt={imageAlt}
                  fill
                  preload
                  sizes="(min-width: 1024px) 30vw, 55vw"
                  className="object-cover object-[50%_20%]"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <span aria-hidden className="font-serif text-[clamp(4rem,10vw,9rem)] leading-none text-fg-muted/70">
                    {monogram}
                  </span>
                </div>
              )}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-black/5 ring-inset dark:ring-white/8" />
          </div>
        </div>
      </div>

      {/* Featured result in the foreground. */}
      {featured && (
        <div data-scroll-speed="-170" className="absolute bottom-0 left-[4%] w-[64%] sm:w-[52%] lg:left-[16%] lg:w-[43%]">
          <div data-depth="18">
            <div
              data-reveal="plate"
              className="rounded-md border border-line bg-elevated p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-label text-fg-muted">{featured.label}</p>
                <span aria-hidden className="grid size-7 place-items-center rounded-sm bg-accent-subtle text-accent">
                  <ArrowUpRight className="size-4" strokeWidth={2} />
                </span>
              </div>
              <p className="mt-4 text-[clamp(2.5rem,1.6rem+2.6vw,4rem)] leading-[0.9] font-semibold tracking-[-0.045em] text-fg">
                <MetricValue metric={featured} />
              </p>
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

/** Supporting results below the visual on small screens. */
export function HeroLedgerMobile({ ledger }: { ledger: HeroMetric[] }) {
  if (ledger.length === 0) return null;
  return (
    <dl className={cn("mt-10 grid grid-cols-2 gap-x-6 border-t border-line lg:hidden", ledger.length === 3 && "sm:grid-cols-3")}>
      {ledger.map((metric) => (
        <div key={metric.id} data-ledger-row className="border-b border-line py-4">
          <dt className="text-small text-fg-muted">{metric.label}</dt>
          <dd className="mt-1.5 text-[1.5rem] leading-none font-semibold tracking-[-0.03em] text-fg">
            <MetricValue metric={metric} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
