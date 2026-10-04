"use client";

import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteMedia } from "@/actions/media";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { confirmDelete, reportResult, showError, toast } from "@/lib/feedback/alerts";
import { MEDIA_ACCEPT, type MediaItem } from "@/lib/media/types";
import { uploadFile } from "./upload";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Basic media library: upload and delete. Alt text editing, search and the
 * reusable picker dialog are added in the media step.
 */
export function MediaLibrary({ items, maxUploadMb }: { items: MediaItem[]; maxUploadMb: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result.ok) uploaded++;
      else await showError(`Couldn't upload ${file.name}`, result.error);
    }
    setUploading(false);
    if (input.current) input.current.value = "";
    if (uploaded) {
      void toast(uploaded === 1 ? "Image uploaded." : `${uploaded} images uploaded.`);
      router.refresh();
    }
  }

  async function remove(item: MediaItem) {
    if (!(await confirmDelete(`"${item.originalName}"`))) return;
    startTransition(async () => {
      await reportResult(await deleteMedia({ id: item.id }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small text-fg-muted">JPG, PNG, WebP, AVIF or GIF, up to {maxUploadMb} MB.</p>
        <input
          ref={input}
          type="file"
          accept={MEDIA_ACCEPT}
          multiple
          className="sr-only"
          id="media-upload"
          onChange={(event) => void onFiles(event.target.files)}
        />
        <Button onClick={() => input.current?.click()} loading={uploading}>
          {!uploading && <Upload className="size-4" aria-hidden />}
          Upload images
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No images yet" description="Uploaded images will appear here." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="group overflow-hidden rounded-lg border border-line bg-surface">
              <div className="aspect-[4/3] bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt} loading="lazy" className="size-full object-cover" />
              </div>
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-fg" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <p className="text-[0.75rem] text-fg-muted">
                    {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                    {formatSize(item.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  className="grid size-7 shrink-0 place-items-center rounded-sm text-fg-muted hover:bg-danger-subtle hover:text-danger"
                  aria-label={`Delete ${item.originalName}`}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
