import { TextLink } from "@/components/site/action-link";
import { SectionIntro } from "@/components/site/section-intro";
import { getPublicEntries } from "@/lib/entities/service";
import { SectionMotion } from "../motion/section-motion";
import type { ListSectionContent } from "../defs";
import { ServicesList, type ServiceItem } from "./services-list";
import type { SectionProps } from "./types";

export async function ServicesSection({ content, index, id }: SectionProps<ListSectionContent>) {
  const entries = await getPublicEntries("services", { limit: Number(content.limit) || 6 });
  if (!entries.length) return null;
  const services: ServiceItem[] = entries.map((entry) => ({
    id: entry.id,
    title: String(entry.title ?? ""),
    summary: String(entry.summary ?? ""),
    description: String(entry.description ?? ""),
    metricValue: String(entry.metricValue ?? ""),
    metricLabel: String(entry.metricLabel ?? ""),
    tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
  }));
  const headingId = `${id}-heading`;

  return (
    <SectionMotion variant="services" labelledBy={content.heading ? headingId : undefined} className="section-space bg-surface">
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
        <ServicesList services={services} />
      </div>
    </SectionMotion>
  );
}
