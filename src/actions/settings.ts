"use server";

import { updateTag } from "next/cache";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import { cacheTags } from "@/lib/cms/cache-tags";
import { readSettings, saveSettings } from "@/lib/cms/settings";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { findMediaByIds } from "@/lib/media/service";
import type { ActionResult } from "@/types/actions";
import { parseSettingsForm, settingsFormSchemas } from "@/validation/settings-forms";
import { FORM_SETTINGS_GROUPS, type FormSettingsGroup } from "@/validation/settings";
import { parseInput } from "@/validation/utils";

function isFormGroup(value: string): value is FormSettingsGroup {
  return (FORM_SETTINGS_GROUPS as readonly string[]).includes(value);
}

/** Rejects references to media that no longer exist. */
async function assertMediaExists(fields: Record<string, string | null>) {
  const found = await findMediaByIds(Object.values(fields));
  const missing = Object.entries(fields).filter(([, id]) => id && !found.has(id));
  if (missing.length) {
    throw new ValidationError(
      Object.fromEntries(missing.map(([field]) => [field, ["That image no longer exists. Choose another."]])),
    );
  }
}

const SUCCESS: Record<FormSettingsGroup, string> = {
  site: "General settings saved.",
  branding: "Branding saved.",
  social: "Social links saved.",
  seo: "SEO defaults saved.",
  header: "Header settings saved.",
  footer: "Footer saved.",
};

/**
 * Saves one settings form. Bind the group on the client:
 * `saveSettingsForm.bind(null, "site")`. The group is re-validated here.
 */
export async function saveSettingsForm(
  group: string,
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    if (!isFormGroup(group)) throw new NotFoundError("Unknown settings group.");
    await authorize(group === "seo" ? "seo:manage" : "settings:manage");

    const input = parseSettingsForm(group, formData);
    switch (group) {
      case "header": {
        const value = parseInput(settingsFormSchemas.header, input);
        const navigation = await readSettings("navigation");
        await saveSettings("navigation", { ...navigation, ...value });
        updateTag(cacheTags.settings("navigation"));
        break;
      }
      case "branding": {
        const value = parseInput(settingsFormSchemas.branding, input);
        await assertMediaExists(value);
        await saveSettings("branding", value);
        updateTag(cacheTags.settings("branding"));
        break;
      }
      case "seo": {
        const value = parseInput(settingsFormSchemas.seo, input);
        await assertMediaExists({ defaultOgImageMediaId: value.defaultOgImageMediaId });
        await saveSettings("seo", value);
        updateTag(cacheTags.settings("seo"));
        break;
      }
      case "site":
        await saveSettings("site", parseInput(settingsFormSchemas.site, input));
        updateTag(cacheTags.settings("site"));
        break;
      case "footer":
        await saveSettings("footer", parseInput(settingsFormSchemas.footer, input));
        updateTag(cacheTags.settings("footer"));
        break;
      case "social":
        await saveSettings("social", parseInput(settingsFormSchemas.social, input));
        updateTag(cacheTags.settings("social"));
        break;
    }
    return { ok: true, data: undefined, message: SUCCESS[group] };
  });
}
