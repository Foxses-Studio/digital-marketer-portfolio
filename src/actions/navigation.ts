"use server";

import { updateTag } from "next/cache";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import { cacheTags } from "@/lib/cms/cache-tags";
import {
  addNavItem,
  deleteNavItem as deleteItem,
  reorderNavItems as reorderItems,
  setNavItemEnabled as setEnabled,
  updateNavItem as updateItem,
} from "@/lib/cms/navigation";
import type { ActionResult } from "@/types/actions";
import {
  navItemFormInput,
  navItemFormSchema,
  navItemIdSchema,
  navItemToggleSchema,
  navItemUpdateSchema,
  navReorderSchema,
} from "@/validation/navigation";
import { parseInput } from "@/validation/utils";

/** Header menu actions. All require `settings:manage`. */

function done(message: string): ActionResult {
  updateTag(cacheTags.settings("navigation"));
  return { ok: true, data: undefined, message };
}

export async function createNavItem(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("settings:manage");
    await addNavItem(parseInput(navItemFormSchema, navItemFormInput(formData)));
    return done("Menu item added.");
  });
}

/** Bind the item id on the client: `updateNavItem.bind(null, id)`. */
export async function updateNavItem(
  id: string,
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("settings:manage");
    await updateItem(parseInput(navItemUpdateSchema, { ...navItemFormInput(formData), id }));
    return done("Menu item saved.");
  });
}

export async function setNavItemEnabled(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("settings:manage");
    const { id, enabled } = parseInput(navItemToggleSchema, input);
    await setEnabled(id, enabled);
    return done(enabled ? "Menu item shown." : "Menu item hidden.");
  });
}

export async function deleteNavItem(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("settings:manage");
    await deleteItem(parseInput(navItemIdSchema, input).id);
    return done("Menu item deleted.");
  });
}

export async function reorderNavItems(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("settings:manage");
    await reorderItems(parseInput(navReorderSchema, input).order);
    return done("Menu order saved.");
  });
}
