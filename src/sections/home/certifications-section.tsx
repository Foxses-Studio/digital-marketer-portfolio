import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionIntro } from "@/components/site/section-intro";
import { getMediaMap } from "@/lib/cms/media";
import { getPublicEntries } from "@/lib/entities/service";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import type { SectionProps } from "./types";

/** Certifications as a compact ledger: issuer mark, name, year, link. */
export async function CertificationsSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const items = await getPublicEntries("certifications");
  if (!items.length) return null;
  const media = await getMediaMap(items.map((item) => item.logoMediaId as string | null));
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="certifications" labelledBy={content.heading ? headingId : undefined} className="pb-[var(--section-space)]">
      <div className="container-wide grid gap-x-[clamp(3rem,6vw,7rem)] gap-y-10 border-t border-line pt-[clamp(3rem,6vw,5rem)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <SectionIntro id={headingId} index={index} label={content.label} heading={content.heading} highlight={content.highlight} description={content.description} className="[&_h2]:text-h3 [&_h2]:max-w-[16ch]" />
        <ul className="grid sm:grid-cols-2">
          {items.map((item) => {
            const logo = item.logoMediaId ? media[item.logoMediaId as string] : undefined;
            const issuer = String(item.issuer ?? "");
            const body = (
              <>
                <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xs border border-line bg-surface text-label text-fg-secondary">
                  {logo ? <Image src={logo.url} alt="" fill sizes="44px" className="object-contain p-1.5" /> : issuer.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-medium text-fg">{String(item.name ?? "")}</span>
                  <span className="mt-0.5 block text-small text-fg-muted">
                    {issuer} · <span className="tabular-nums">{String(item.year ?? "")}</span>
                  </span>
                </span>
                {Boolean(item.credentialUrl) && (
                  <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-fg-muted transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover/cert:translate-x-0.5 group-hover/cert:-translate-y-0.5 group-hover/cert:text-accent" />
                )}
              </>
            );
            return (
              <li key={item.id} data-cert className="relative border-b border-line sm:odd:pr-6 sm:even:pl-6">
                <span data-cert-line aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-line-strong" />
                {item.credentialUrl ? (
                  <a href={String(item.credentialUrl)} target="_blank" rel="noopener noreferrer" className="group/cert flex items-start gap-4 py-5">
                    {body}
                    <span className="sr-only"> (view credential, opens in a new tab)</span>
                  </a>
                ) : (
                  <div className="flex items-start gap-4 py-5">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </SectionMotion>
  );
}
