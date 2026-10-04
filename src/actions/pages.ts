"use server";

import { updateTag } from "next/cache";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import { cacheTags } from "@/lib/cms/cache-tags";
import {
  reorderSections as reorderSectionsRecord,
  setSectionEnabled as setSectionEnabledRecord,
  updateSection as updateSectionRecord,
} from "@/lib/cms/pages";
import type { ActionResult } from "@/types/actions";
import {
  reorderSectionsSchema,
  setSectionEnabledSchema,
  updateSectionSchema,
} from "@/validation/pages";
import { parseInput } from "@/validation/utils";

/** Page section mutations. All require `content:manage`. */

export async function updateSection(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await authorize("content:manage");
    const { page, sectionId, content, config } = parseInput(updateSectionSchema, input);
    await updateSectionRecord(page, sectionId, { content, config }, admin.id);
    updateTag(cacheTags.page(page));
    return { ok: true, data: undefined, message: "Section saved." };
  });
}

export async function setSectionEnabled(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await authorize("content:manage");
    const { page, sectionId, enabled } = parseInput(setSectionEnabledSchema, input);
    await setSectionEnabledRecord(page, sectionId, enabled, admin.id);
    updateTag(cacheTags.page(page));
    return { ok: true, data: undefined, message: enabled ? "Section shown." : "Section hidden." };
  });
}

export async function reorderSections(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await authorize("content:manage");
    const { page, order } = parseInput(reorderSectionsSchema, input);
    await reorderSectionsRecord(page, order, admin.id);
    updateTag(cacheTags.page(page));
    return { ok: true, data: undefined, message: "Order saved." };
  });
}
