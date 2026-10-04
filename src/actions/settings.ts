"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { cacheTags } from "@/lib/cms/cache-tags";
import { saveSettings } from "@/lib/cms/settings";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";
import { isSettingsGroup, settingsSchemas } from "@/validation/settings";
import { fieldErrors } from "@/validation/utils";

/** Validates and saves one settings group, then refreshes cached reads. */
export async function updateSettings(
  group: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  if (!isSettingsGroup(group)) return actionError("Unknown settings group.");

  const parsed = settingsSchemas[group].safeParse(input);
  if (!parsed.success) {
    return actionError("Check the highlighted fields.", fieldErrors(parsed.error));
  }

  await saveSettings(group, parsed.data);
  updateTag(cacheTags.settings(group));
  return actionSuccess(undefined, "Settings saved.");
}
