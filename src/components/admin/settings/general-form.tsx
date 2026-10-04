"use client";

import { SwitchField, TextField } from "@/components/ui/field";
import type { Settings } from "@/validation/settings";
import { FormActions, FormSection } from "./form-section";
import { useSettingsForm } from "./use-settings-form";

export function GeneralSettingsForm({ values }: { values: Settings<"site"> }) {
  const { onSubmit, pending, errors } = useSettingsForm("site");
  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FormSection title="Identity" description="How you and your website are named across the site.">
        <TextField label="Website name" name="siteName" defaultValue={values.siteName} required maxLength={80} errors={errors.siteName} hint="Used in browser titles and as the brand when no logo or name is set." />
        <TextField label="Professional name" name="professionalName" defaultValue={values.professionalName} maxLength={80} errors={errors.professionalName} hint="Your name as it should appear publicly." />
        <TextField label="Professional title" name="professionalTitle" defaultValue={values.professionalTitle} maxLength={80} errors={errors.professionalTitle} placeholder="e.g. Performance Marketing Lead" />
        <TextField label="Website address" name="siteUrl" type="url" defaultValue={values.siteUrl} errors={errors.siteUrl} placeholder="https://example.com" hint="Used for canonical links and social sharing." />
      </FormSection>
      <FormSection title="Contact" description="Shown where the site lists your contact details.">
        <TextField label="Contact email" name="contactEmail" type="email" defaultValue={values.contactEmail} errors={errors.contactEmail} />
        <TextField label="Phone number" name="phone" type="tel" defaultValue={values.phone} errors={errors.phone} />
        <SwitchField label="Show phone number" description="Display the phone number publicly." name="showPhone" defaultChecked={values.showPhone} />
        <TextField label="Location" name="location" defaultValue={values.location} maxLength={80} errors={errors.location} placeholder="e.g. London, UK · Remote" />
        <SwitchField label="Show location" description="Display the location publicly." name="showLocation" defaultChecked={values.showLocation} />
      </FormSection>
      <FormActions pending={pending} />
    </form>
  );
}
