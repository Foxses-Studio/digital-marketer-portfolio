"use client";

import { MediaField } from "@/components/admin/media/media-field";
import type { MediaItem } from "@/lib/media/types";
import { FormActions, FormSection } from "./form-section";
import { useSettingsForm } from "./use-settings-form";

type Media = MediaItem | null;

export function BrandingSettingsForm({ logo, darkLogo, favicon }: { logo: Media; darkLogo: Media; favicon: Media }) {
  const { onSubmit, pending, errors } = useSettingsForm("branding");
  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FormSection title="Logo" description="Shown in the header. Without a logo, your name is shown as text.">
        <MediaField name="logoMediaId" label="Logo" initial={logo} errors={errors.logoMediaId} hint="A wide PNG or WebP with a transparent background works best." />
        <MediaField name="darkLogoMediaId" label="Dark mode logo" initial={darkLogo} errors={errors.darkLogoMediaId} tone="dark" hint="Optional. Used in dark mode instead of the main logo." />
      </FormSection>
      <FormSection title="Favicon" description="The small icon shown in browser tabs.">
        <MediaField name="faviconMediaId" label="Favicon" initial={favicon} errors={errors.faviconMediaId} preview="square" hint="A square PNG, at least 512×512." />
      </FormSection>
      <FormActions pending={pending} />
    </form>
  );
}
