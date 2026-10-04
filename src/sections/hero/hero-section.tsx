import { ArrowUpRight } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cms/cache-tags";
import { getSettings } from "@/lib/cms/settings";
import { findMediaByIds } from "@/lib/media/service";
import { cn } from "@/lib/utils/cn";
import { SmartLink } from "@/sections/header/smart-link";
import type { HeroContent } from "./definition";
import { HeroMotion } from "./hero-motion";
import { HeroLedgerMobile, HeroVisual } from "./hero-visual";
import "./hero.css";

async function getHeroImage(id: string | null) {
  "use cache";
  cacheTag(cacheTags.media);
  cacheLife("max");
  if (!id) return null;
  return (await findMediaByIds([id])).get(id) ?? null;
}

/** Splits the heading around the highlighted phrase (first occurrence). */
function headingParts(heading: string, highlight: string) {
  const index = highlight ? heading.indexOf(highlight) : -1;
  if (index === -1) return { before: heading, highlight: "", after: "" };
  return {
    before: heading.slice(0, index),
    highlight,
    after: heading.slice(index + highlight.length),
  };
}

/** Type scale follows the heading length, so any CMS text keeps its shape. */
function headingSize(length: number) {
  if (length <= 34) return "short";
  if (length <= 72) return "medium";
  return "long";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Home hero. Server-rendered from CMS content (fully readable without
 * JavaScript and by search engines); HeroMotion adds the choreography.
 */
export async function HeroSection({ content }: { content: HeroContent }) {
  const [site, image] = await Promise.all([getSettings("site"), getHeroImage(content.imageMediaId)]);

  const name = site.professionalName || site.siteName;
  // Fall back to the site identity rather than inventing marketing copy.
  const heading = content.heading || name;
  const eyebrow = content.eyebrow || site.professionalTitle;
  const parts = headingParts(heading, content.highlight);
  const metrics = content.metrics.filter((metric) => metric.enabled);
  const [featured = null, ...ledger] = metrics;
  const primary = content.primaryCta.enabled ? content.primaryCta : null;
  const secondary = content.secondaryCta.enabled ? content.secondaryCta : null;
  const availability = content.availability.enabled ? content.availability.text : "";

  return (
    <HeroMotion>
      <section
        data-hero
        aria-labelledby="hero-heading"
        className="relative overflow-x-clip lg:flex lg:min-h-[calc(100svh-var(--header-height))] lg:items-center"
      >
        <div className="container-wide grid w-full gap-y-14 pt-8 pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:items-center lg:gap-x-[clamp(3rem,6vw,7.5rem)] lg:py-[clamp(1.75rem,5svh,3.5rem)]">
          {/* Copy */}
          <div className="relative z-10 min-w-0">
            {eyebrow && (
              <div data-scroll="support">
                <p data-reveal="eyebrow" className="flex items-center gap-3 text-label text-fg-secondary">
                  <span aria-hidden className="h-px w-8 bg-accent" />
                  {eyebrow}
                </p>
              </div>
            )}

            <div data-scroll="heading">
              <h1
                id="hero-heading"
                data-reveal="heading"
                data-size={headingSize(heading.length)}
                className="hero-heading mt-6 text-fg sm:mt-7"
              >
                {parts.before}
                {parts.highlight && <em className="hero-highlight">{parts.highlight}</em>}
                {parts.after}
              </h1>
            </div>

            <div data-scroll="support">
              {content.description && (
                <p
                  data-reveal="description"
                  className="mt-7 max-w-[34rem] text-body-lg text-fg-secondary sm:mt-8"
                >
                  {content.description}
                </p>
              )}

              {(primary || secondary) && (
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-10 lg:mt-[clamp(1.75rem,4.5svh,2.5rem)]">
                  {primary && (
                    <div data-reveal="cta">
                      <SmartLink
                        href={primary.url}
                        newTab={false}
                        className="group/primary inline-flex h-13 items-center gap-2.5 rounded-sm bg-button-primary pr-5 pl-6 text-[0.9375rem] font-medium text-button-primary-fg transition-[background-color,box-shadow] duration-300 hover:bg-button-primary-hover hover:shadow-md"
                      >
                        <span data-magnetic-inner className="inline-flex items-center gap-2.5">
                          {primary.label}
                          <span aria-hidden className="relative grid size-5 place-items-center overflow-hidden">
                            <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/primary:translate-x-5 group-hover/primary:-translate-y-5" />
                            <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/primary:translate-x-0 group-hover/primary:translate-y-0" />
                          </span>
                        </span>
                      </SmartLink>
                    </div>
                  )}
                  {secondary && (
                    <div data-reveal="cta">
                      <SmartLink
                        href={secondary.url}
                        newTab={false}
                        className="group/secondary relative inline-flex h-13 items-center gap-2 text-[0.9375rem] font-medium text-fg"
                      >
                        <span className="relative">
                          {secondary.label}
                          <span aria-hidden className="absolute inset-x-0 -bottom-1 h-px bg-fg/20" />
                          <span
                            aria-hidden
                            className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/secondary:scale-x-100"
                          />
                        </span>
                        <ArrowUpRight aria-hidden className="size-4 text-fg-muted transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover/secondary:translate-x-0.5 group-hover/secondary:-translate-y-0.5 group-hover/secondary:text-accent" />
                      </SmartLink>
                    </div>
                  )}
                </div>
              )}

              {availability && (
                <p
                  data-reveal="availability"
                  className="mt-10 flex items-center gap-3 border-t border-line pt-6 text-small text-fg-secondary sm:mt-12 lg:mt-[clamp(2rem,5.5svh,3rem)] lg:pt-[clamp(1rem,3svh,1.5rem)]"
                >
                  <span aria-hidden className="hero-status relative size-2 rounded-full bg-accent-2" />
                  {availability}
                </p>
              )}
            </div>
          </div>

          {/* Marketing performance visual */}
          <div className={cn("relative min-w-0", !featured && "pb-6")}>
            <HeroVisual
              image={image}
              imageAlt={content.imageAlt || name}
              monogram={initials(name)}
              label={content.visualLabel}
              channels={content.channels}
              featured={featured}
              ledger={ledger}
            />
            <HeroLedgerMobile ledger={ledger} />
          </div>
        </div>
      </section>
    </HeroMotion>
  );
}
