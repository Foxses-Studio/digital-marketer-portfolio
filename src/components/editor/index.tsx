"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded editor: Tiptap/ProseMirror only download on pages that show
 * an editor, never on the public site.
 */
export const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-80 animate-pulse rounded-md border border-line bg-surface-muted" aria-hidden />
  ),
});

export type { ImageRequest, RichTextEditorProps } from "./rich-text-editor";
