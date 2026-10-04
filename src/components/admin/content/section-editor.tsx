"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSection } from "@/actions/pages";
import { PreviewFrame } from "@/components/admin/pages/preview-frame";
import { FormSection } from "@/components/admin/settings/form-section";
import { Button } from "@/components/ui/button";
import type { FieldGroup } from "@/lib/content/fields";
import { getSectionDefinition } from "@/lib/cms/sections/registry";
import { showError, toast } from "@/lib/feedback/alerts";
import type { MediaItem } from "@/lib/media/types";
import { collectErrors } from "./defaults";
import { FieldsEditor, type FieldErrors } from "./fields-editor";

/**
 * Generic editor for a homepage section, rendered from the section's
 * field groups and validated with its content schema. Collection-backed
 * sections show their entries below (passed in as `children`).
 */
export function SectionEditor({
  page,
  sectionId,
  type,
  enabled,
  initial,
  media: initialMedia,
  previewPath,
  children,
}: {
  page: string;
  sectionId: string;
  type: string;
  enabled: boolean;
  initial: Record<string, unknown>;
  media: Record<string, MediaItem>;
  previewPath: string;
  children?: React.ReactNode;
}) {
  const definition = getSectionDefinition(type)!;
  const groups: FieldGroup[] = definition.fields ?? [];
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  const [media, setMedia] = useState(initialMedia);
  const [pending, startTransition] = useTransition();

  function save() {
    const parsed = definition.content.safeParse(value);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      void toast("Check the highlighted fields.", "error");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await updateSection({ page, sectionId, content: parsed.data });
      if (result.ok) {
        setDirty(false);
        setVersion((v) => v + 1);
        void toast(`${definition.label} saved.`);
        router.refresh();
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        void toast("Check the highlighted fields.", "error");
      } else {
        await showError("Couldn't save", result.error);
      }
    });
  }

  return (
    <div className="mt-1">
      <div className="mb-8">
        <h1 className="text-title text-fg">{definition.label}</h1>
        <p className="mt-1.5 text-body text-fg-secondary">
          {definition.description}{" "}
          {!enabled && (
            <span className="text-warning">
              This section is hidden.{" "}
              <Link href={`/admin/pages/${page}`} className="underline underline-offset-4">Show it</Link>
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-10 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          {groups.length > 0 && (
            <form
              noValidate
              aria-label={`${definition.label} content`}
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              {groups.map((group) => (
                <FormSection key={group.title} stacked title={group.title} description={group.description}>
                  <FieldsEditor
                    fields={group.fields}
                    value={value}
                    onChange={(next) => {
                      setValue(next);
                      setDirty(true);
                    }}
                    errors={errors}
                    media={media}
                    onMedia={(item) => setMedia((all) => ({ ...all, [item.id]: item }))}
                  />
                </FormSection>
              ))}
              <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
                {dirty && <span className="mr-auto text-small text-fg-muted">Unsaved changes</span>}
                <Button type="submit" loading={pending}>Save section</Button>
              </div>
            </form>
          )}
          {children}
        </div>
        <aside aria-label="Preview" className="2xl:sticky 2xl:top-24 2xl:self-start">
          <PreviewFrame path={previewPath} version={version} />
        </aside>
      </div>
    </div>
  );
}
