"use client";

import { SwitchField, TextField } from "@/components/ui/field";
import { SOCIAL_PLATFORMS } from "@/config/social";
import type { Settings } from "@/validation/settings";
import { FormActions, FormSection } from "./form-section";
import { useSettingsForm } from "./use-settings-form";

export function SocialSettingsForm({ values }: { values: Settings<"social"> }) {
  const { onSubmit, pending, errors } = useSettingsForm("social");
  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FormSection title="Social profiles" description="Turn on the profiles you want to show. Links that are off or empty are never displayed.">
        <ul className="divide-y divide-line rounded-md border border-line bg-surface">
          {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
            <li key={key} className="space-y-4 p-4">
              <SwitchField label={label} name={`${key}.enabled`} defaultChecked={values[key].enabled} />
              <div className={key === "website" ? "grid gap-4 sm:grid-cols-[12rem_1fr]" : undefined}>
                {key === "website" && (
                  <TextField label="Link label" name={`${key}.label`} defaultValue={values[key].label} maxLength={30} placeholder="e.g. Newsletter" errors={errors[`${key}.label`]} />
                )}
                <TextField
                  label={`${label} URL`}
                  name={`${key}.url`}
                  type="url"
                  defaultValue={values[key].url}
                  placeholder={placeholder}
                  errors={errors[`${key}.url`]}
                />
              </div>
            </li>
          ))}
        </ul>
      </FormSection>
      <FormActions pending={pending} />
    </form>
  );
}
