import "server-only";
import { randomUUID } from "node:crypto";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { NAV_ITEM_LIMIT, settingsSchemas, type NavItem, type Settings } from "@/validation/settings";
import { readSettings, saveSettings } from "./settings";

/**
 * Header navigation items, stored in the "navigation" settings group.
 * Each change reads the current list, applies one operation and saves it
 * back after validating the whole group.
 */

async function mutate(change: (navigation: Settings<"navigation">) => Settings<"navigation">) {
  const current = await readSettings("navigation");
  const next = settingsSchemas.navigation.parse(change(structuredClone(current)));
  await saveSettings("navigation", next);
}

function indexOf(items: NavItem[], id: string) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) throw new NotFoundError("That menu item no longer exists.");
  return index;
}

export async function addNavItem(input: Omit<NavItem, "id">) {
  await mutate((navigation) => {
    if (navigation.items.length >= NAV_ITEM_LIMIT) {
      throw new ConflictError(`The menu can have up to ${NAV_ITEM_LIMIT} items.`);
    }
    navigation.items.push({ ...input, id: randomUUID() });
    return navigation;
  });
}

export async function updateNavItem(item: NavItem) {
  await mutate((navigation) => {
    navigation.items[indexOf(navigation.items, item.id)] = item;
    return navigation;
  });
}

export async function setNavItemEnabled(id: string, enabled: boolean) {
  await mutate((navigation) => {
    navigation.items[indexOf(navigation.items, id)]!.enabled = enabled;
    return navigation;
  });
}

export async function deleteNavItem(id: string) {
  await mutate((navigation) => {
    navigation.items.splice(indexOf(navigation.items, id), 1);
    return navigation;
  });
}

/** `order` must contain exactly the current item ids. */
export async function reorderNavItems(order: string[]) {
  await mutate((navigation) => {
    const byId = new Map(navigation.items.map((item) => [item.id, item]));
    const valid =
      order.length === byId.size && new Set(order).size === order.length && order.every((id) => byId.has(id));
    if (!valid) throw new ValidationError({ order: ["The menu changed. Reload and try again."] });
    navigation.items = order.map((id) => byId.get(id)!);
    return navigation;
  });
}
