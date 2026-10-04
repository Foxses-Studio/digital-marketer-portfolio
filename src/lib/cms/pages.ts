import "server-only";
import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import type { z } from "zod";
import { PAGE_DEFINITIONS, type PageKey } from "@/config/pages";
import { collection } from "@/db";
import type { PageDocument, SectionInstance } from "@/db/schema";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { fieldErrors } from "@/validation/utils";
import { cacheTags } from "./cache-tags";
import { getSectionDefinition } from "./sections/registry";

/** A section ready to render: known type, validated content and config. */
export type ResolvedSection = {
  id: string;
  type: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
};

export type PublicPage = {
  key: PageKey;
  title: string;
  seo: PageDocument["seo"];
  sections: ResolvedSection[];
};

/**
 * Parses stored data, resetting only the fields that fail validation (to
 * their defaults) so one bad value never blanks a whole section.
 */
function parseRepairing(schema: z.ZodType<Record<string, unknown>>, value: unknown, label: string) {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;
  const stored = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const broken = new Set(parsed.error.issues.map((issue) => String(issue.path[0])));
  console.error(`${label} has invalid fields (${[...broken].join(", ")}); using defaults for those.`);
  const retry = schema.safeParse(Object.fromEntries(Object.entries(stored).filter(([key]) => !broken.has(key))));
  return retry.success ? retry.data : schema.parse({});
}

/** Validates stored section data; unknown section types are dropped. */
function resolveSection(section: SectionInstance): ResolvedSection | null {
  const definition = getSectionDefinition(section.type);
  if (!definition) return null;
  const label = `Section ${section.type}:${section.id}`;
  return {
    id: section.id,
    type: section.type,
    content: parseRepairing(definition.content, section.content, label),
    config: parseRepairing(definition.config, section.config, label),
  };
}

/** Public read: enabled sections only, in order. Cached until edited. */
export async function getPublicPage(key: PageKey): Promise<PublicPage> {
  "use cache";
  cacheTag(cacheTags.page(key));
  cacheLife("max");

  const pages = await collection("pages");
  const doc = await pages.findOne({ key });
  // Sections the page defines but hasn't stored yet render with defaults,
  // so a fresh install shows the designed page before any editing.
  const stored = doc?.sections ?? [];
  const storedTypes = new Set(stored.map((section) => section.type));
  const missing = PAGE_DEFINITIONS[key].sections
    .filter((type) => !storedTypes.has(type))
    .map(newSection);
  const sections = [...stored, ...missing]
    .filter((section) => section.enabled)
    .map(resolveSection)
    .filter((section): section is ResolvedSection => section !== null);

  return {
    key,
    title: doc?.title ?? PAGE_DEFINITIONS[key].title,
    seo: doc?.seo ?? {},
    sections,
  };
}

function newSection(type: string): SectionInstance {
  const definition = getSectionDefinition(type);
  if (!definition) throw new Error(`Unknown section type "${type}" in page config.`);
  return {
    id: randomUUID(),
    type,
    enabled: true,
    content: definition.content.parse({}),
    config: definition.config.parse({}),
  };
}

/**
 * Admin read. Creates the page on first access and appends any section
 * types the page definition lists but the stored page lacks, so new
 * sections shipped with the app appear automatically with defaults.
 */
export async function getPageForAdmin(key: PageKey): Promise<PageDocument> {
  const pages = await collection("pages");
  const definition = PAGE_DEFINITIONS[key];
  const now = new Date();

  await pages.updateOne(
    { key },
    {
      $setOnInsert: {
        key,
        title: definition.title,
        seo: {},
        sections: [],
        updatedBy: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  const found = (await pages.findOne({ key }))!;
  // Tolerate documents missing optional fields (older or partial writes).
  const doc: PageDocument = { ...found, seo: found.seo ?? {}, sections: found.sections ?? [] };
  const existing = new Set(doc.sections.map((section) => section.type));
  const missing = definition.sections.filter((type) => !existing.has(type));
  if (missing.length === 0) return doc;

  const added = missing.map(newSection);
  await pages.updateOne({ key }, { $push: { sections: { $each: added } } });
  return { ...doc, sections: [...doc.sections, ...added] };
}

/**
 * Applies a change to a page's sections and saves the whole list, only if
 * nobody else saved the page in the meantime (optimistic concurrency on
 * `updatedAt`). Throws instead of silently doing nothing.
 */
async function mutateSections(
  key: PageKey,
  updatedBy: string,
  change: (sections: SectionInstance[]) => SectionInstance[],
) {
  const page = await getPageForAdmin(key);
  const sections = change(structuredClone(page.sections));
  const pages = await collection("pages");
  const result = await pages.updateOne(
    { key, updatedAt: page.updatedAt },
    { $set: { sections, updatedAt: new Date(), updatedBy: new ObjectId(updatedBy) } },
  );
  if (result.matchedCount !== 1) {
    throw new ConflictError("This page was changed by someone else. Reload and try again.");
  }
}

function sectionIndex(sections: SectionInstance[], sectionId: string) {
  const index = sections.findIndex((section) => section.id === sectionId);
  if (index === -1) throw new NotFoundError("That section no longer exists.");
  return index;
}

/** Validates content/config against the section definition, then saves. */
export async function updateSection(
  key: PageKey,
  sectionId: string,
  input: { content?: unknown; config?: unknown },
  updatedBy: string,
) {
  await mutateSections(key, updatedBy, (sections) => {
    const section = sections[sectionIndex(sections, sectionId)]!;
    const definition = getSectionDefinition(section.type);
    if (!definition) throw new NotFoundError("This section type is no longer available.");
    if (input.content !== undefined) {
      const parsed = definition.content.safeParse(input.content);
      if (!parsed.success) throw new ValidationError(fieldErrors(parsed.error));
      section.content = parsed.data;
    }
    if (input.config !== undefined) {
      const parsed = definition.config.safeParse(input.config);
      if (!parsed.success) throw new ValidationError(fieldErrors(parsed.error));
      section.config = parsed.data;
    }
    return sections;
  });
}

export async function setSectionEnabled(
  key: PageKey,
  sectionId: string,
  enabled: boolean,
  updatedBy: string,
) {
  await mutateSections(key, updatedBy, (sections) => {
    sections[sectionIndex(sections, sectionId)]!.enabled = enabled;
    return sections;
  });
}

/** `orderedIds` must contain exactly the page's section ids. */
export async function reorderSections(
  key: PageKey,
  orderedIds: string[],
  updatedBy: string,
) {
  await mutateSections(key, updatedBy, (sections) => {
    const byId = new Map(sections.map((section) => [section.id, section]));
    const isPermutation =
      orderedIds.length === byId.size &&
      new Set(orderedIds).size === orderedIds.length &&
      orderedIds.every((id) => byId.has(id));
    if (!isPermutation) {
      throw new ValidationError({ order: ["The section list changed. Reload and try again."] });
    }
    return orderedIds.map((id) => byId.get(id)!);
  });
}
