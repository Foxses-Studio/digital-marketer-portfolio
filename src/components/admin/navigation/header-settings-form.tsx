"use client";

import Link from "next/link";
import { FormActions, FormSection } from "@/components/admin/settings/form-section";
import { useSettingsForm } from "@/components/admin/settings/use-settings-form";
import { SwitchField, TextField } from "@/components/ui/field";
import type { Settings } from "@/validation/settings";

export function HeaderSettingsForm({ values }: { values: Settings<"navigation"> }) {
  const { onSubmit, pending, errors } = useSettingsForm("header");
  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FormSection title="Call to action" description="The button on the right of the header and at the bottom of the mobile menu.">
        <SwitchField label="Show button" name="cta.enabled" defaultChecked={values.cta.enabled} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Button label" name="cta.label" defaultValue={values.cta.label} maxLength={40} errors={errors["cta.label"]} placeholder="e.g. Let's work together" />
          <TextField label="Button link" name="cta.url" defaultValue={values.cta.url} errors={errors["cta.url"]} placeholder="/contact" />
        </div>
        <SwitchField label="Open in a new tab" name="cta.newTab" defaultChecked={values.cta.newTab} />
      </FormSection>
      <FormSection title="Behavior" description="How the header responds to scrolling.">
        <SwitchField label="Sticky header" description="Keep the header at the top of the screen while scrolling." name="sticky" defaultChecked={values.sticky} />
        <SwitchField label="Hide while scrolling down" description="Only with a sticky header. It slides away when scrolling down and returns when scrolling up." name="hideOnScroll" defaultChecked={values.hideOnScroll} />
      </FormSection>
      <FormSection title="Logo" description="The header uses the logo from Branding settings.">
        <Link href="/admin/settings/branding" className="text-small font-medium text-fg underline underline-offset-4 hover:text-accent">
          Open Branding settings
        </Link>
      </FormSection>
      <FormActions pending={pending} />
    </form>
  );
}
