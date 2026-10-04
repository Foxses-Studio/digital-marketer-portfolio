"use client";

import { omit } from "@/lib/utils/omit";
import { ArrowDown, ArrowUp, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { createEntry, deleteEntry, reorderEntries, setEntryEnabled, updateEntry } from "@/actions/entries";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { getEntityDefinition, type EntityType, type EntryRecord } from "@/lib/entities/registry";
import { confirmDelete, reportResult, showError, toast } from "@/lib/feedback/alerts";
import type { MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";
import { collectErrors, defaultsFromFields, slugify } from "./defaults";
import { FieldsEditor, type FieldErrors } from "./fields-editor";

/**
 * List + inline editor for one content collection. Used on the collection's
 * own admin page and embedded in the homepage section that displays it.
 */
export function EntityManager({
  type,
  items: initial,
  media: initialMedia,
}: {
  type: EntityType;
  items: EntryRecord[];
  media: Record<string, MediaItem>;
}) {
  const definition = getEntityDefinition(type);
  const router = useRouter();
  const [items, setItems] = useOptimistic(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const [media, setMedia] = useState(initialMedia);
  const enabledLabel = definition.enabledLabel ?? "Visible";

  const run = (optimistic: EntryRecord[], action: () => Promise<Parameters<typeof reportResult>[0]>) =>
    startTransition(async () => {
      setItems(optimistic);
      await reportResult(await action());
      router.refresh();
    });

  const move = (index: number, delta: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
    run(next, () => reorderEntries(type, next.map((i) => i.id)));
  };

  const title = (item: Record<string, unknown>) => String(item[definition.titleField] ?? "");

  return (
    <div className="space-y-3">
      {editing === "new" && (
        <EntryForm
          type={type}
          media={media}
          onMedia={(m) => setMedia((all) => ({ ...all, [m.id]: m }))}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {items.length === 0 && editing !== "new" ? (
        <EmptyState icon={Layers} title={`No ${definition.label.toLowerCase()} yet`} description={`Add your first ${definition.singular}.`} />
      ) : (
        <ol aria-label={definition.label} className={cn("divide-y divide-line rounded-md border border-line bg-surface", pending && "opacity-80")}>
          {items.map((item, index) =>
            editing === item.id ? (
              <li key={item.id} className="p-4">
                <EntryForm
                  type={type}
                  entry={item}
                  media={media}
                  onMedia={(m) => setMedia((all) => ({ ...all, [m.id]: m }))}
                  onDone={() => {
                    setEditing(null);
                    router.refresh();
                  }}
                />
              </li>
            ) : (
              <li key={item.id} data-entry={title(item)} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || pending} aria-label={`Move ${title(item)} up`} className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30"><ArrowUp className="size-3.5" aria-hidden /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1 || pending} aria-label={`Move ${title(item)} down`} className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30"><ArrowDown className="size-3.5" aria-hidden /></button>
                </div>
                <div className={cn("min-w-0 flex-1", !item.enabled && "opacity-50")}>
                  <p className="truncate text-small font-medium text-fg">{title(item)}</p>
                  <p className="truncate text-[0.8125rem] text-fg-muted">{definition.subtitle(item)}</p>
                </div>
                <label className="flex items-center gap-2 text-small text-fg-secondary">
                  <span className="hidden sm:inline">{item.enabled ? enabledLabel : "Hidden"}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={item.enabled}
                    aria-label={`${enabledLabel}: ${title(item)}`}
                    onChange={() =>
                      run(
                        items.map((i) => (i.id === item.id ? { ...i, enabled: !i.enabled } : i)),
                        () => setEntryEnabled(type, item.id, !item.enabled),
                      )
                    }
                    className="relative h-5 w-9 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface-muted transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-3 before:rounded-full before:bg-fg-muted before:transition-transform checked:border-button-primary checked:bg-button-primary checked:before:translate-x-4 checked:before:bg-button-primary-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                </label>
                <button type="button" onClick={() => setEditing(item.id)} aria-label={`Edit ${title(item)}`} className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg"><Pencil className="size-3.5" aria-hidden /></button>
                <button
                  type="button"
                  aria-label={`Delete ${title(item)}`}
                  onClick={async () => {
                    if (!(await confirmDelete(`"${title(item)}"`))) return;
                    run(items.filter((i) => i.id !== item.id), () => deleteEntry(type, item.id));
                  }}
                  className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-danger-subtle hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </li>
            ),
          )}
        </ol>
      )}
      {editing !== "new" && (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            Add {definition.singular}
          </Button>
        </div>
      )}
    </div>
  );
}

function EntryForm({
  type,
  entry,
  media,
  onMedia,
  onDone,
}: {
  type: EntityType;
  entry?: EntryRecord;
  media: Record<string, MediaItem>;
  onMedia: (item: MediaItem) => void;
  onDone: () => void;
}) {
  const definition = getEntityDefinition(type);
  const [value, setValue] = useState<Record<string, unknown>>(() => {
    if (!entry) return defaultsFromFields(definition.fields);
    return { ...defaultsFromFields(definition.fields), ...omit(entry, ["id", "enabled", "sortOrder"]) };
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(entry));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function change(next: Record<string, unknown>) {
    if (definition.slugged) {
      if (next.slug !== value.slug) setSlugTouched(true);
      else if (!slugTouched && next[definition.titleField] !== value[definition.titleField]) {
        next = { ...next, slug: slugify(String(next[definition.titleField] ?? "")) };
      }
    }
    setValue(next);
  }

  function save() {
    const parsed = definition.schema.safeParse(value);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      void toast("Check the highlighted fields.", "error");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = entry ? await updateEntry(type, entry.id, parsed.data) : await createEntry(type, parsed.data);
      if (result.ok) {
        void toast(entry ? `Saved.` : `${definition.singular[0]!.toUpperCase()}${definition.singular.slice(1)} added.`);
        onDone();
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        void toast("Check the highlighted fields.", "error");
      } else {
        await showError("Couldn't save", result.error);
      }
    });
  }

  return (
    <form
      noValidate
      aria-label={entry ? `Edit ${String(entry[definition.titleField])}` : `New ${definition.singular}`}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="rounded-md border border-line bg-canvas p-4 sm:p-5"
    >
      <p className="mb-4 text-small font-semibold text-fg">{entry ? `Edit ${definition.singular}` : `New ${definition.singular}`}</p>
      <FieldsEditor fields={definition.fields} value={value} onChange={change} errors={errors} media={media} onMedia={onMedia} />
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone} disabled={pending}>Cancel</Button>
        <Button type="submit" loading={pending}>{entry ? "Save" : `Add ${definition.singular}`}</Button>
      </div>
    </form>
  );
}
