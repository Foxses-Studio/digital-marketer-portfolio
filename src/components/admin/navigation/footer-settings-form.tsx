"use client";

import { FormActions, FormSection } from "@/components/admin/settings/form-section";
import { useSettingsForm } from "@/components/admin/settings/use-settings-form";
import { SwitchField, TextField, TextareaField } from "@/components/ui/field";
import type { Settings } from "@/validation/settings";

export function FooterSettingsForm({ values }: { values: Settings<"footer"> }) {
  const { onSubmit, pending, errors } = useSettingsForm("footer");
  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FormSection title="Footer" description="Brand, email and social links come from Settings; the menu from above.">
        <TextareaField label="Short description" name="description" defaultValue={values.description} maxLength={200} showCount rows={2} errors={errors.description} />
        <TextField label="Copyright text" name="copyright" defaultValue={values.copyright} maxLength={120} errors={errors.copyright} placeholder="© {year} Your Name" hint="{year} becomes the current year. Leave empty for the default." />
        <SwitchField label="Show menu links" name="showNavigation" defaultChecked={values.showNavigation} />
        <SwitchField label="Show social links" name="showSocial" defaultChecked={values.showSocial} />
      </FormSection>
      <FormActions pending={pending} label="Save footer" />
    </form>
  );
}
