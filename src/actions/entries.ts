"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import { cacheTags } from "@/lib/cms/cache-tags";
import { NotFoundError } from "@/lib/errors";
import { isEntityType, type EntityType } from "@/lib/entities/registry";
import {
  createEntry as create,
  deleteEntry as remove,
  reorderEntries as reorder,
  setEntryEnabled as setEnabled,
  updateEntry as update,
} from "@/lib/entities/service";
import type { ActionResult } from "@/types/actions";
import { parseInput } from "@/validation/utils";

/** Content collection actions. All require `content:manage`. */

function entityType(value: unknown): EntityType {
  if (typeof value !== "string" || !isEntityType(value)) throw new NotFoundError("Unknown collection.");
  return value;
}

const idSchema = z.string().regex(/^[a-f0-9]{24}$/, "Invalid id.");

function done(type: EntityType, message: string, data?: unknown): ActionResult<unknown> {
  updateTag(cacheTags.collection(type));
  return { ok: true, data, message };
}

export async function createEntry(type: string, data: unknown): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await authorize("content:manage");
    const t = entityType(type);
    const id = await create(t, data);
    return done(t, "Added.", { id });
  });
}

export async function updateEntry(type: string, id: string, data: unknown): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await authorize("content:manage");
    const t = entityType(type);
    await update(t, parseInput(idSchema, id), data);
    return done(t, "Saved.");
  });
}

export async function setEntryEnabled(type: string, id: string, enabled: boolean): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await authorize("content:manage");
    const t = entityType(type);
    await setEnabled(t, parseInput(idSchema, id), parseInput(z.boolean(), enabled));
    return done(t, enabled ? "Now visible." : "Hidden.");
  });
}

export async function deleteEntry(type: string, id: string): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await authorize("content:manage");
    const t = entityType(type);
    await remove(t, parseInput(idSchema, id));
    return done(t, "Deleted.");
  });
}

export async function reorderEntries(type: string, order: unknown): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await authorize("content:manage");
    const t = entityType(type);
    await reorder(t, parseInput(z.array(idSchema).max(200), order));
    return done(t, "Order saved.");
  });
}
