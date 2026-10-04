"use server";

import { updateTag } from "next/cache";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import { cacheTags } from "@/lib/cms/cache-tags";
import { saveSettings } from "@/lib/cms/settings";
import { NotFoundError } from "@/lib/errors";
import type { ActionResult } from "@/types/actions";
import { isSettingsGroup, settingsSchemas } from "@/validation/settings";
import { parseInput } from "@/validation/utils";

/** Validates and saves one settings group, then refreshes cached reads. */
export async function updateSettings(
  group: string,
  input: unknown,
): Promise<ActionResult> {
  return runAction(async () => {
    await authorize(group === "seo" ? "seo:manage" : "settings:manage");
    if (!isSettingsGroup(group)) throw new NotFoundError("Unknown settings group.");
    const value = parseInput(settingsSchemas[group], input);
    await saveSettings(group, value);
    updateTag(cacheTags.settings(group));
    return { ok: true, data: undefined, message: "Settings saved." };
  });
}
