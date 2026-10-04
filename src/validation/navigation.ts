import { z } from "zod";
import { navItemSchema } from "./settings";

/** Shared by the menu item form (client) and the navigation actions (server). */
export const navItemFormSchema = navItemSchema.omit({ id: true });

export const navItemUpdateSchema = navItemSchema;

export const navItemIdSchema = z.object({ id: z.uuid() });

export const navItemToggleSchema = z.object({ id: z.uuid(), enabled: z.boolean() });

export const navReorderSchema = z.object({ order: z.array(z.uuid()).max(50) });

export function navItemFormInput(fd: FormData) {
  const text = (name: string) => (typeof fd.get(name) === "string" ? (fd.get(name) as string) : "");
  return {
    label: text("label"),
    url: text("url"),
    enabled: fd.get("enabled") === "on",
    newTab: fd.get("newTab") === "on",
  };
}
