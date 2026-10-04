import Link from "next/link";
import { TextLink } from "@/components/site/action-link";
import { CoverArt } from "@/components/site/cover-art";
import { SectionIntro } from "@/components/site/section-intro";
import { getMediaMap } from "@/lib/cms/media";
import { getPublicEntries } from "@/lib/entities/service";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import type { SectionProps } from "./types";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function formatDate(value: unknown) {
  const date = new Date(`${String(value)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

/**
 * Latest insights: a lead article (featured, or the newest) beside a list
 * of the next most recent. Fed by published blog posts.
 */
export async function BlogSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const limit = Number(content.limit) || 4;
  const all = await getPublicEntries("blogPosts");
  if (!all.length) return null;
  const newest = [...all].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  const lead = newest.find((post) => post.featured) ?? newest[0]!;
  const rest = newest.filter((post) => post !== lead).slice(0, limit - 1);
  const media = await getMediaMap([lead, ...rest].map((post) => post.coverMediaId as string | null));
  const headingId = `${id}-heading`;

  const meta = (post: (typeof all)[number]) => (
    <p className="flex items-center gap-2 text-label text-fg-muted">
      <span className="text-accent">{String(post.category ?? "")}</span>
      <span aria-hidden>·</span>
      <time dateTime={String(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
    </p>
  );

  return (
    <SectionMotion variant="blog" labelledBy={content.heading ? headingId : undefined} className="section-space">
      <div className="container-wide">
        <SectionIntro
          id={headingId}
          index={index}
          label={content.label}
          heading={content.heading}
          highlight={content.highlight}
          description={content.description}
          aside={content.cta.enabled ? <TextLink cta={content.cta} /> : undefined}
        />

        <div className="mt-14 grid gap-x-[clamp(2.5rem,5vw,5rem)] gap-y-12 lg:mt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <article data-post className="group/post relative">
            <div data-post-cover className="relative aspect-[16/10] overflow-hidden rounded-xs">
              <CoverArt
                image={lead.coverMediaId ? media[lead.coverMediaId as string] ?? null : null}
                style={String(lead.coverStyle ?? "ink")}
                label={String(lead.category ?? "")}
                sizes="(min-width: 64rem) 55vw, 92vw"
                imageClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/post:scale-[1.035]"
              />
            </div>
            <div className="mt-7">{meta(lead)}</div>
            <h3 className="mt-3 max-w-[30ch] text-h2">
              <Link href={`/blog/${String(lead.slug)}`} className="after:absolute after:inset-0 hover:text-fg-secondary">
                {String(lead.title ?? "")}
              </Link>
            </h3>
            <p className="mt-4 max-w-[40rem] text-body-lg text-fg-secondary">{String(lead.excerpt ?? "")}</p>
          </article>

          <ul className="flex flex-col border-t border-line">
            {rest.map((post) => (
              <li key={post.id} data-post className="group/post relative grid grid-cols-[minmax(0,1fr)_6.5rem] gap-5 border-b border-line py-6 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
                <div className="min-w-0">
                  {meta(post)}
                  <h3 className="mt-2.5 text-[1.125rem] leading-snug font-semibold tracking-[-0.015em] text-fg">
                    <Link href={`/blog/${String(post.slug)}`} className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[var(--ease-out-expo)] group-hover/post:bg-[length:100%_1px] after:absolute after:inset-0">
                      {String(post.title ?? "")}
                    </Link>
                  </h3>
                </div>
                <div data-post-cover className="relative aspect-[4/3] self-start overflow-hidden rounded-xs">
                  <CoverArt
                    image={post.coverMediaId ? media[post.coverMediaId as string] ?? null : null}
                    style={String(post.coverStyle ?? "ink")}
                    label=""
                    sizes="140px"
                        imageClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/post:scale-[1.06]"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionMotion>
  );
}
