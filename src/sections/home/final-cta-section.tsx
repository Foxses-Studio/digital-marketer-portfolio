import { ArrowUpRight } from "lucide-react";
import { ButtonLink, TextLink } from "@/components/site/action-link";
import { HighlightText } from "@/components/site/highlight-text";
import { getContactDetails } from "@/lib/cms/site";
import { SectionMotion } from "../motion/section-motion";
import type { FinalCtaContent } from "../defs";
import type { SectionProps } from "./types";

/**
 * Closing invitation: the dark surface rises from a rounded card to full
 * bleed and runs straight into the footer. The heading scales up through
 * its masked reveal; the email link is magnetic on desktop.
 */
export async function FinalCtaSection({ content, id }: SectionProps<FinalCtaContent>) {
  if (!content.heading) return null;
  const contact = await getContactDetails();
  const email = content.showEmail ? contact.email : null;
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="finalCta" tone="feature" labelledBy={headingId} className="text-feature-fg">
      <div data-feature-bg aria-hidden className="absolute inset-0 bg-feature" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div data-cta-glow className="absolute top-[-20%] left-1/2 size-[min(70rem,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent)]" />
      </div>
      <div className="relative container-wide pt-[clamp(6rem,4rem+8vw,12rem)] pb-[clamp(4rem,3rem+5vw,8rem)]">
        {content.label && (
          <p data-fade className="flex items-center gap-3 text-label text-feature-muted">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {content.label}
          </p>
        )}
        <div data-cta-heading className="origin-bottom-left">
          <h2 id={headingId} data-split className="final-cta-heading mt-8 max-w-[14ch] text-feature-fg">
            <HighlightText text={content.heading} highlight={content.highlight} />
          </h2>
        </div>
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            {content.description && <p data-fade className="max-w-[36rem] text-body-lg text-feature-muted">{content.description}</p>}
            {(content.primaryCta.enabled || content.secondaryCta.enabled) && (
              <div data-fade className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <span data-magnetic className="inline-flex">
                  <ButtonLink cta={content.primaryCta} tone="accent" />
                </span>
                <TextLink cta={content.secondaryCta} tone="feature" />
              </div>
            )}
            {content.note && (
              <p data-fade className="mt-8 flex items-center gap-3 text-small text-feature-muted">
                <span aria-hidden className="size-1.5 rounded-full bg-accent-2" />
                {content.note}
              </p>
            )}
          </div>
          {email && (
            <a data-fade data-magnetic href={`mailto:${email}`} className="group/email inline-flex items-center gap-4 self-end border-b border-feature-fg/20 pb-3 text-feature-fg">
              <span data-magnetic-inner className="inline-flex items-center gap-4">
                <span className="font-display text-[clamp(1.25rem,0.9rem+1.4vw,2.25rem)] font-medium tracking-[-0.03em] break-all transition-colors duration-300 group-hover/email:text-accent">
                  {email}
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-feature-fg/25 transition-[background-color,border-color] duration-300 group-hover/email:border-accent group-hover/email:bg-accent">
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </span>
            </a>
          )}
        </div>
      </div>
    </SectionMotion>
  );
}
