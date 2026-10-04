import type { z } from "zod";
import type { FieldGroup } from "@/lib/content/fields";
import type { EntityType } from "@/lib/entities/registry";

/**
 * A predefined, professionally designed section. The application owns the
 * design (the component); the definition describes what the admin may
 * edit. Admins can change content and allowed settings, toggle visibility
 * and reorder sections, but they can't create new section types or
 * layouts: this is deliberately not a free-form page builder.
 */
export type SectionDefinition<
  Content extends z.ZodType<Record<string, unknown>> = z.ZodType<Record<string, unknown>>,
  Config extends z.ZodType<Record<string, unknown>> = z.ZodType<Record<string, unknown>>,
> = {
  /** Stable identifier stored in the database, e.g. "hero". */
  type: string;
  /** Shown in the admin panel. */
  label: string;
  description?: string;
  /**
   * Editable content (headings, text, CTAs, media ids...). Every field
   * needs a default (`.default()`), so `content.parse({})` yields a
   * complete, valid object for a newly added section.
   */
  content: Content;
  /** Presentation options the design allows (e.g. number of items). */
  config: Config;
  /** Editor layout for the generic section editor (the Hero has its own). */
  fields?: FieldGroup[];
  /** Collection whose entries this section displays (managed alongside it). */
  entity?: EntityType;
};

export type AnySectionDefinition = SectionDefinition;

/** Identity helper that keeps the schema types for inference. */
export function defineSection<
  Content extends z.ZodType<Record<string, unknown>>,
  Config extends z.ZodType<Record<string, unknown>>,
>(definition: SectionDefinition<Content, Config>) {
  return definition;
}

export type SectionContent<D extends AnySectionDefinition> = z.output<D["content"]>;
export type SectionConfig<D extends AnySectionDefinition> = z.output<D["config"]>;
