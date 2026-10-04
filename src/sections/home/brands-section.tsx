import Image from "next/image";
import { getMediaMap } from "@/lib/cms/media";
import { cn } from "@/lib/utils/cn";
import { HighlightText } from "@/components/site/highlight-text";
import { SectionMotion } from "../motion/section-motion";
import type { SectionProps } from "./types";
import type { BrandsContent } from "../defs";

const WORDMARK: Record<string, string> = {
  sans: "font-display text-[1.65rem] font-semibold tracking-[-0.04em]",
  serif: "font-serif text-[2rem] italic tracking-[-0.02em]",
  mono: "font-mono text-[1.15rem] font-medium uppercase tracking-[0.14em]",
  wide: "font-display text-[1rem] font-bold uppercase tracking-[0.32em]",
};

/**
 * Trusted brands: a continuous marquee of client wordmarks or logos. The
 * second copy exists only for the seamless loop (hidden from assistive
 * tech, and from everyone when the marquee is static).
 */
export async function BrandsSection({ content }: SectionProps<BrandsContent>) {
  const brands = content.brands.filter((brand) => brand.enabled);
  if (!brands.length) return null;
  const media = await getMediaMap(brands.map((brand) => brand.logoMediaId));

  // Short lists repeat inside each group so one group always spans the
  // marquee; repeats are hidden from assistive tech and from the static view.
  const repeats = Math.ceil(10 / brands.length);
  const loop = Array.from({ length: repeats }, (_, r) => brands.map((brand) => ({ brand, repeat: r > 0 }))).flat();

  const group = (copy: boolean) => (
    <ul
      data-brands-group
      aria-hidden={copy || undefined}
      className={cn("brands-group flex shrink-0 items-center gap-x-[clamp(2.5rem,5vw,5rem)] pr-[clamp(2.5rem,5vw,5rem)]", copy && "brands-copy")}
    >
      {loop.map(({ brand, repeat }, index) => {
        const hidden = copy || repeat;
        const logo = brand.logoMediaId ? media[brand.logoMediaId] : undefined;
        const mark = logo ? (
          <Image
            src={logo.url}
            alt={hidden ? "" : brand.name}
            width={logo.width ?? 160}
            height={logo.height ?? 48}
            sizes="160px"
            className="h-8 w-auto max-w-[9rem] object-contain opacity-70 grayscale transition-[opacity,filter] duration-500 group-hover/brand:opacity-100 group-hover/brand:grayscale-0"
          />
        ) : (
          <span className={cn("whitespace-nowrap text-fg-muted transition-colors duration-500 group-hover/brand:text-fg", WORDMARK[brand.style])}>
            {brand.name}
          </span>
        );
        return (
          <li key={`${brand.id}-${index}`} aria-hidden={(!copy && repeat) || undefined} className={cn("group/brand flex h-16 shrink-0 items-center", repeat && "brands-repeat")}>
            {brand.url && !hidden ? (
              <a href={brand.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                {mark}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              mark
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <SectionMotion variant="brands" labelledBy={content.heading || content.label ? "brands-heading" : undefined} className="border-y border-line py-[clamp(2.5rem,5vw,4rem)]">
      <div className="container-wide flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
        {(content.label || content.heading) && (
          <div data-fade className="shrink-0 lg:w-[16rem]">
            {content.label && <p className="text-label text-fg-muted">{content.label}</p>}
            {content.heading && (
              <h2 id="brands-heading" className="mt-2 text-small text-fg-secondary">
                <HighlightText text={content.heading} highlight={content.highlight} />
              </h2>
            )}
            {!content.heading && content.label && <h2 id="brands-heading" className="sr-only">{content.label}</h2>}
          </div>
        )}
        <div data-brands-viewport className="brands-viewport relative min-w-0 flex-1 overflow-hidden">
          <div data-brands-track className="brands-track flex w-max min-w-full">
            {group(false)}
            {group(true)}
          </div>
        </div>
      </div>
    </SectionMotion>
  );
}
