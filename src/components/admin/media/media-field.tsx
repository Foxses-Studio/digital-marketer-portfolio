"use client";

import { ImageIcon, LoaderCircle, Upload, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { showError } from "@/lib/feedback/alerts";
import { MEDIA_ACCEPT, type MediaItem } from "@/lib/media/types";
import { cn } from "@/lib/utils/cn";
import { uploadFile } from "./upload";

/**
 * Reusable image selector for any CMS field (logo, favicon, covers...).
 * Submits the selected media id through a hidden input named `name`.
 * Picks from the media library or uploads a new image in place.
 */
export function MediaField({
  name,
  label,
  hint,
  initial,
  errors,
  preview = "wide",
  tone = "light",
}: {
  name: string;
  label: string;
  hint?: string;
  initial: MediaItem | null;
  errors?: string[];
  /** Preview shape: wide for logos and covers, square for icons. */
  preview?: "wide" | "square";
  /** Dark preview background, e.g. for a dark-mode logo. */
  tone?: "light" | "dark";
}) {
  const [selected, setSelected] = useState<MediaItem | null>(initial);
  const dialog = useRef<HTMLDialogElement>(null);
  const labelId = useId();
  const invalid = Boolean(errors?.length);

  return (
    <div role="group" aria-labelledby={labelId}>
      <p id={labelId} className="mb-1.5 text-small font-medium text-fg">
        {label}
      </p>
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <div
        className={cn(
          "flex flex-col gap-4 rounded-md border bg-surface p-3 sm:flex-row sm:items-center",
          invalid ? "border-danger" : "border-line",
        )}
      >
        <div
          className={cn(
            "grid h-20 shrink-0 place-items-center overflow-hidden rounded-sm",
            preview === "square" ? "w-20" : "w-full sm:w-40",
            tone === "dark" ? "bg-black/90" : "bg-surface-muted",
          )}
        >
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.url} alt="" className="max-h-full max-w-full object-contain p-2" />
          ) : (
            <ImageIcon className="size-5 text-fg-muted" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-small text-fg">{selected ? selected.originalName : "No image selected"}</p>
          {selected?.width && selected.height ? (
            <p className="text-[0.75rem] text-fg-muted">
              {selected.width}×{selected.height}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => dialog.current?.showModal()}>
              {selected ? "Change" : "Choose image"}
            </Button>
            {selected && (
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      {invalid ? (
        <p className="mt-1.5 text-small text-danger" role="alert">
          {errors![0]}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-small text-fg-muted">{hint}</p>
      ) : null}
      <MediaPickerDialog
        ref={dialog}
        title={label}
        selectedId={selected?.id ?? null}
        onSelect={(item) => {
          setSelected(item);
          dialog.current?.close();
        }}
      />
    </div>
  );
}

function MediaPickerDialog({
  ref,
  title,
  selectedId,
  onSelect,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
  title: string;
  selectedId: string | null;
  onSelect: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const json = await response.json();
      setItems(json.ok ? (json.data as MediaItem[]) : []);
    } catch {
      setItems([]);
    }
  }, []);

  // Load the library the first time the dialog opens.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new MutationObserver(() => {
      if (element.open && items === null) void load();
    });
    observer.observe(element, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, [ref, items, load]);

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);
    if (input.current) input.current.value = "";
    if (!result.ok) return void showError(`Couldn't upload ${file.name}`, result.error);
    setItems((current) => [result.data, ...(current ?? [])]);
    onSelect(result.data);
  }

  return (
    <dialog
      ref={ref}
      aria-label={`Choose ${title.toLowerCase()}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto w-[min(48rem,calc(100vw-2rem))] max-w-none rounded-lg border border-line bg-elevated p-0 text-fg shadow-lg backdrop:bg-black/40"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-body font-semibold">Choose an image</h2>
        <div className="flex items-center gap-2">
          <input
            ref={input}
            type="file"
            accept={MEDIA_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => void upload(event.target.files)}
          />
          <Button size="sm" onClick={() => input.current?.click()} loading={uploading}>
            {!uploading && <Upload className="size-3.5" aria-hidden />}
            Upload
          </Button>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-hover hover:text-fg"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-5">
        {items === null ? (
          <div className="grid h-40 place-items-center text-fg-muted">
            <LoaderCircle className="size-5 animate-spin" aria-label="Loading images" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-small text-fg-muted">No images yet. Upload one to get started.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-pressed={item.id === selectedId}
                  className={cn(
                    "block w-full overflow-hidden rounded-md border text-left transition-colors hover:border-line-strong",
                    item.id === selectedId ? "border-fg ring-1 ring-fg" : "border-line",
                  )}
                >
                  <span className="grid aspect-[4/3] place-items-center bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.alt} loading="lazy" className="max-h-full max-w-full object-contain" />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-[0.75rem] text-fg-secondary">{item.originalName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
