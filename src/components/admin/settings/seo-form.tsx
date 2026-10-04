"use client";

import { MediaField } from "@/components/admin/media/media-field";
import { TextField, TextareaField } from "@/components/ui/field";
import type { MediaItem } from "@/lib/media/types";
import type { Settings } from "@/validation/settings";
import { FormActions, FormSection } from "./form-section";
import { useSettingsForm } from "./use-settings-form";

export function SeoSettingsForm({ values, ogImage }: { values: Settings<"seo">; ogImage: MediaItem | null }) {
  const { onSubmit, pending, errors } = useSettingsForm("seo");
  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FormSection title="Search defaults" description="Used on pages that don't set their own title and description.">
        <TextField label="Default title" name="defaultTitle" defaultValue={values.defaultTitle} maxLength={70} errors={errors.defaultTitle} hint="Shown in search results and browser tabs. Up to 70 characters." />
        <TextField label="Title format" name="titleTemplate" defaultValue={values.titleTemplate} maxLength={70} errors={errors.titleTemplate} hint='How page titles are built. %s is the page title, e.g. "%s | Jane Doe".' />
        <TextareaField label="Default description" name="defaultDescription" defaultValue={values.defaultDescription} maxLength={160} showCount rows={3} errors={errors.defaultDescription} hint="A one or two sentence summary for search results." />
      </FormSection>
      <FormSection title="Social sharing" description="The image shown when your site is shared on social networks and messaging apps.">
        <MediaField name="defaultOgImageMediaId" label="Default share image" initial={ogImage} errors={errors.defaultOgImageMediaId} hint="1200×630 pixels works best." />
      </FormSection>
      <FormActions pending={pending} />
    </form>
  );
}
