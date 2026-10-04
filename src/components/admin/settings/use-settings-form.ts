"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { saveSettingsForm } from "@/actions/settings";
import { useActionForm } from "@/hooks/use-action-form";
import { parseSettingsForm, settingsFormSchemas } from "@/validation/settings-forms";
import type { FormSettingsGroup } from "@/validation/settings";

/** Wires a settings form to its group's schema, parser and save action. */
export function useSettingsForm(group: FormSettingsGroup) {
  const router = useRouter();
  const onSuccess = useCallback(() => router.refresh(), [router]);
  return useActionForm({
    action: saveSettingsForm.bind(null, group),
    schema: settingsFormSchemas[group],
    toInput: (formData) => parseSettingsForm(group, formData),
    onSuccess,
  });
}
