import Image from "next/image";
import { TextLink } from "@/components/site/action-link";
import { HighlightText } from "@/components/site/highlight-text";
import { getMediaMap } from "@/lib/cms/media";
import { getSettings } from "@/lib/cms/settings";
import { SectionMotion } from "../motion/section-motion";
import type { AboutContent } from "../defs";
import type { SectionProps } from "./types";

/**
 * About preview. The statement fills in word by word with scroll; the
 * image is revealed through a rising mask. Without an image, a typographic
 * panel (name, title, location) holds the same space.
 */
export async function AboutSection({ content, index, id }: SectionProps<AboutContent>) {
  if (!content.statement && !content.body) return null;
  const [site, media] = await Promise.all([getSettings("site"), getMediaMap([content.imageMediaId])]);
  const image = content.imageMediaId ? media[content.imageMediaId] : undefined;
  const name = site.professionalName || site.siteName;
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="about" labelledBy={content.statement ? headingId : undefined} className="section-space">
      <div className="container-wide grid gap-x-[clamp(3rem,7vw,8rem)] gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="order-2 lg:order-1">
          <div data-about-frame className="relative aspect-[4/5] w-full max-w-[34rem] overflow-hidden rounded-xs bg-surface-muted">
            {image ? (
              <div data-about-image className="absolute inset-0">
                <Image src={image.url} alt={content.imageAlt || image.alt || name} fill sizes="(min-width: 64rem) 34vw, 90vw" className="object-cover" />
              </div>
            ) : (
              <div data-about-image className="absolute inset-0 flex flex-col justify-between bg-feature p-[clamp(1.5rem,3vw,2.5rem)] text-feature-fg">
                <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--color-feature-fg)_1px,transparent_1px),linear-gradient(90deg,var(--color-feature-fg)_1px,transparent_1px)] [background-size:2.75rem_2.75rem]" />
                <p className="relative text-label text-feature-muted">{site.professionalTitle || content.label}</p>
                <p aria-hidden className="relative font-serif text-[clamp(5rem,12vw,10rem)] leading-[0.8] text-accent italic">
                  {name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
                </p>
                <div className="relative">
                  <p className="text-h3">{name}</p>
                  {site.showLocation && site.location && <p className="mt-1 text-small text-feature-muted">{site.location}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="order-1 flex flex-col lg:order-2 lg:pt-6">
          {(index || content.label) && (
            <p data-fade className="flex items-center gap-3 text-label text-fg-muted">
              {index && <span className="tabular-nums">{String(index).padStart(2, "0")}</span>}
              {index && content.label && <span aria-hidden className="h-px w-8 bg-line-strong" />}
              {content.label && <span>{content.label}</span>}
            </p>
          )}
          {content.statement && (
            <h2 id={headingId} data-about-statement className="about-statement mt-6 text-fg">
              <HighlightText text={content.statement} highlight={content.highlight} />
            </h2>
          )}
          <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:mt-14">
            {content.body && <p data-fade className="text-body-lg text-fg-secondary">{content.body}</p>}
            {content.details.length > 0 && (
              <dl data-fade className="grid grid-cols-2 gap-x-6 gap-y-6 self-start border-t border-line pt-6">
                {content.details.map((detail) => (
                  <div key={detail.id}>
                    <dt className="text-label text-fg-muted">{detail.label}</dt>
                    <dd className="mt-1.5 text-body font-medium text-fg">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {content.cta.enabled && (
            <div data-fade className="mt-10">
              <TextLink cta={content.cta} />
            </div>
          )}
        </div>
      </div>
    </SectionMotion>
  );
}
