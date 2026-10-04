"use client";

import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { MediaField } from "@/components/admin/media/media-field";
import { RichTextEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { SelectField, SwitchField, TextField, TextareaField } from "@/components/ui/field";
import { getPath, setPath, type FieldDef } from "@/lib/content/fields";
import { confirmDelete } from "@/lib/feedback/alerts";
import type { MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";
import type { RichTextDocument } from "@/validation/rich-text";

export type FieldErrors = Record<string, string[]>;

type Props = {
  fields: FieldDef[];
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  errors: FieldErrors;
  media: Record<string, MediaItem>;
  onMedia: (item: MediaItem) => void;
  /** Dotted prefix for error lookups inside lists and groups. */
  path?: string;
};

/** Renders a form from field descriptors. Values and errors use dotted paths. */
export function FieldsEditor({ fields, value, onChange, errors, media, onMedia, path = "" }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className={field.half ? "" : "sm:col-span-2"}>
          <FieldControl
            field={field}
            value={getPath(value, field.name)}
            onChange={(next) => onChange(setPath(value, field.name, next))}
            errors={errors}
            media={media}
            onMedia={onMedia}
            path={path ? `${path}.${field.name}` : field.name}
          />
        </div>
      ))}
    </div>
  );
}

type ControlProps = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  errors: FieldErrors;
  media: Record<string, MediaItem>;
  onMedia: (item: MediaItem) => void;
  path: string;
};

function FieldControl({ field, value, onChange, errors, media, onMedia, path }: ControlProps) {
  const error = errors[path];
  switch (field.kind) {
    case "text":
      return field.rows ? (
        <TextareaField label={field.label} hint={field.hint} value={String(value ?? "")} maxLength={field.max} showCount={Boolean(field.max)} rows={field.rows} placeholder={field.placeholder} errors={error} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <TextField label={field.label} hint={field.hint} value={String(value ?? "")} maxLength={field.max} placeholder={field.placeholder} errors={error} onChange={(e) => onChange(e.target.value)} />
      );
    case "number":
      return (
        <TextField label={field.label} hint={field.hint} type="number" step={field.step ?? "any"} value={value === undefined || value === null ? "" : String(value)} placeholder={field.placeholder} errors={error} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
      );
    case "date":
      return <TextField label={field.label} hint={field.hint} type="date" value={String(value ?? "")} errors={error} onChange={(e) => onChange(e.target.value)} />;
    case "boolean":
      return <SwitchField label={field.label} description={field.hint} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
    case "select":
      return <SelectField label={field.label} hint={field.hint} value={String(value ?? field.options[0]?.value ?? "")} options={field.options} errors={error} onChange={(e) => onChange(e.target.value)} />;
    case "media": {
      const id = typeof value === "string" ? value : null;
      return (
        <MediaField
          key={id ?? "none"}
          name={path}
          label={field.label}
          hint={field.hint}
          preview={field.preview}
          initial={id ? media[id] ?? null : null}
          errors={error}
          onChange={(item) => {
            if (item) onMedia(item);
            onChange(item?.id ?? null);
          }}
        />
      );
    }
    case "richtext":
      return (
        <RichTextEditor
          label={field.label}
          value={(value as RichTextDocument | undefined) ?? null}
          placeholder={field.placeholder}
          onChange={(doc) => onChange(doc)}
          invalid={Boolean(error)}
        />
      );
    case "tags":
      return <TagsControl field={field} value={(value as string[]) ?? []} onChange={onChange} error={error?.[0] ?? findChildError(errors, path)} />;
    case "numbers":
      return <NumbersControl field={field} value={(value as number[]) ?? []} onChange={onChange} error={error?.[0]} />;
    case "group":
      return (
        <fieldset className="rounded-md border border-line bg-surface p-4">
          <legend className="px-1 text-small font-medium text-fg">{field.label}</legend>
          <FieldsEditor fields={field.fields} value={(value as Record<string, unknown>) ?? {}} onChange={onChange} errors={errors} media={media} onMedia={onMedia} path={path} />
        </fieldset>
      );
    case "list":
      return <ListControl field={field} value={(value as Array<Record<string, unknown>>) ?? []} onChange={onChange} errors={errors} media={media} onMedia={onMedia} path={path} />;
  }
}

function findChildError(errors: FieldErrors, path: string) {
  return Object.entries(errors).find(([key]) => key.startsWith(`${path}.`))?.[1][0];
}

function ListControl({
  field,
  value,
  onChange,
  errors,
  media,
  onMedia,
  path,
}: Omit<ControlProps, "field" | "value"> & { field: Extract<FieldDef, { kind: "list" }>; value: Array<Record<string, unknown>> }) {
  const [open, setOpen] = useState<string | null>(null);
  const move = (index: number, delta: -1 | 1) => {
    const next = [...value];
    [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
    onChange(next);
  };
  const remove = async (index: number) => {
    const title = String(value[index]?.[field.titleField] ?? "");
    if (title && !(await confirmDelete(`"${title}"`))) return;
    onChange(value.filter((_, i) => i !== index));
  };
  const add = () => {
    const item = { id: crypto.randomUUID(), ...field.newItem };
    onChange([...value, item]);
    setOpen(item.id);
  };
  const listError = errors[path]?.[0];

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <p className="text-small font-medium text-fg">{field.label}</p>
        <p className="text-[0.8125rem] text-fg-muted">{value.length} of {field.max}</p>
      </div>
      {field.hint && <p className="mb-3 text-small text-fg-muted">{field.hint}</p>}
      <ol className="space-y-2" aria-label={field.label}>
        {value.map((item, index) => {
          const id = String(item.id ?? index);
          const itemPath = `${path}.${index}`;
          const hasError = Object.keys(errors).some((key) => key.startsWith(`${itemPath}.`));
          const expanded = open === id || hasError;
          const enabled = item.enabled !== false;
          return (
            <li key={id} data-list-item className={cn("rounded-md border bg-surface", hasError ? "border-danger" : "border-line")}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button type="button" onClick={() => setOpen(expanded && !hasError ? null : id)} aria-expanded={expanded} className={cn("flex min-w-0 flex-1 items-center gap-2 py-1 text-left", !enabled && "opacity-50")}>
                  <ChevronDown className={cn("size-4 shrink-0 text-fg-muted transition-transform", expanded && "rotate-180")} aria-hidden />
                  <span className="truncate text-small font-medium text-fg">{String(item[field.titleField] || `New ${field.itemLabel}`)}</span>
                </button>
                {"enabled" in field.newItem && (
                  <input type="checkbox" role="switch" checked={enabled} aria-label={`Show ${String(item[field.titleField] || field.itemLabel)}`} onChange={(e) => onChange(setPath(value, `${index}.enabled`, e.target.checked))} className="relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface-muted transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-3 before:rounded-full before:bg-fg-muted before:transition-transform checked:border-button-primary checked:bg-button-primary checked:before:translate-x-4 checked:before:bg-button-primary-fg" />
                )}
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${field.itemLabel} ${index + 1} up`} className="grid size-7 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30"><ArrowUp className="size-3.5" aria-hidden /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label={`Move ${field.itemLabel} ${index + 1} down`} className="grid size-7 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-30"><ArrowDown className="size-3.5" aria-hidden /></button>
                <button type="button" onClick={() => void remove(index)} aria-label={`Remove ${field.itemLabel} ${index + 1}`} className="grid size-7 place-items-center rounded-sm text-fg-muted hover:bg-danger-subtle hover:text-danger"><Trash2 className="size-3.5" aria-hidden /></button>
              </div>
              {expanded && (
                <div className="border-t border-line p-4">
                  <FieldsEditor fields={field.fields} value={item} onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))} errors={errors} media={media} onMedia={onMedia} path={itemPath} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {listError && <p className="mt-2 text-small text-danger" role="alert">{listError}</p>}
      <Button variant="secondary" size="sm" className="mt-3" onClick={add} disabled={value.length >= field.max}>
        <Plus className="size-3.5" aria-hidden />
        Add {field.itemLabel}
      </Button>
    </div>
  );
}

function TagsControl({ field, value, onChange, error }: { field: Extract<FieldDef, { kind: "tags" }>; value: string[]; onChange: (v: unknown) => void; error?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const tag = draft.trim();
    if (!tag || value.length >= field.max) return;
    onChange([...value, tag]);
    setDraft("");
  };
  return (
    <div>
      <p className="mb-1.5 text-small font-medium text-fg">{field.label}</p>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <li key={`${tag}-${i}`} className="inline-flex h-8 items-center gap-1 rounded-sm border border-line bg-surface pr-1 pl-3 text-small text-fg">
              {tag}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${tag}`} className="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg"><X className="size-3" aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} disabled={value.length >= field.max} placeholder={field.placeholder} aria-label={`Add to ${field.label}`} className="h-10 min-w-0 flex-1 rounded-sm border border-line-strong bg-surface px-3 text-small text-fg placeholder:text-fg-muted focus:border-focus focus:outline-2 focus:outline-offset-[-1px] focus:outline-focus" />
        <Button variant="secondary" onClick={add} disabled={!draft.trim() || value.length >= field.max}>Add</Button>
      </div>
      {error ? <p className="mt-1.5 text-small text-danger" role="alert">{error}</p> : field.hint ? <p className="mt-1.5 text-small text-fg-muted">{field.hint}</p> : null}
    </div>
  );
}

function NumbersControl({ field, value, onChange, error }: { field: Extract<FieldDef, { kind: "numbers" }>; value: number[]; onChange: (v: unknown) => void; error?: string }) {
  const [text, setText] = useState(value.join(", "));
  const [local, setLocal] = useState<string | null>(null);
  return (
    <TextField
      label={field.label}
      value={text}
      inputMode="decimal"
      placeholder={field.placeholder}
      errors={local ? [local] : error ? [error] : undefined}
      hint={field.hint}
      onChange={(e) => {
        setText(e.target.value);
        const parts = e.target.value.split(/[,\s]+/).filter(Boolean);
        const numbers = parts.map(Number);
        if (numbers.some((n) => !Number.isFinite(n))) return setLocal("Use numbers separated by commas.");
        if (numbers.length > field.max) return setLocal(`Up to ${field.max} values.`);
        setLocal(null);
        onChange(numbers);
      }}
    />
  );
}
