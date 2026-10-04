import { SectionIntro } from "@/components/site/section-intro";
import { getMediaMap } from "@/lib/cms/media";
import { getPublicEntries } from "@/lib/entities/service";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import { TestimonialsSlider, type Testimonial } from "./testimonials-slider";
import type { SectionProps } from "./types";

export async function TestimonialsSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const entries = await getPublicEntries("testimonials");
  if (!entries.length) return null;
  const media = await getMediaMap(entries.map((entry) => entry.avatarMediaId as string | null));
  const testimonials: Testimonial[] = entries.map((entry) => {
    const avatar = entry.avatarMediaId ? media[entry.avatarMediaId as string] : undefined;
    return {
      id: entry.id,
      quote: String(entry.quote ?? ""),
      name: String(entry.name ?? ""),
      role: String(entry.role ?? ""),
      company: String(entry.company ?? ""),
      avatar: avatar ? { url: avatar.url } : null,
    };
  });
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="testimonials" labelledBy={content.heading ? headingId : undefined} className="section-space">
      <div className="container-wide">
        <SectionIntro id={headingId} index={index} label={content.label} heading={content.heading} highlight={content.highlight} description={content.description} />
        <TestimonialsSlider testimonials={testimonials} label={content.heading || "Testimonials"} />
      </div>
    </SectionMotion>
  );
}
