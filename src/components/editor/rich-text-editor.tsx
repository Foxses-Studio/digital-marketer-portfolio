"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  TextQuote,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useId, useMemo } from "react";
import { promptText } from "@/lib/feedback/alerts";
import { isSafeImageUrl, isSafeUrl } from "@/lib/security/url";
import { cn } from "@/lib/utils/cn";
import { EMPTY_RICH_TEXT, type RichTextDocument } from "@/validation/rich-text";
import { createExtensions } from "./extensions";

export type ImageRequest = () => Promise<{ src: string; alt: string } | null>;

export type RichTextEditorProps = {
  value?: RichTextDocument | null;
  onChange?: (value: RichTextDocument) => void;
  /** When set, the JSON is mirrored into a hidden input for plain form posts. */
  name?: string;
  label?: string;
  placeholder?: string;
  /**
   * Supplies an image when the toolbar's image button is used. Defaults to
   * asking for a URL; the media library will plug in here.
   */
  onRequestImage?: ImageRequest;
  invalid?: boolean;
  className?: string;
};

async function askForImageUrl() {
  const src = await promptText({
    title: "Insert image",
    label: "Image URL",
    placeholder: "https://",
    validate: (value) => (isSafeImageUrl(value) ? null : "Enter an http(s) image URL."),
  });
  if (!src) return null;
  const alt = await promptText({
    title: "Describe the image",
    label: "Alt text",
    placeholder: "What the image shows",
    required: false,
  });
  return { src, alt: alt ?? "" };
}

export default function RichTextEditor({
  value,
  onChange,
  name,
  label,
  placeholder = "Start writing…",
  onRequestImage = askForImageUrl,
  invalid = false,
  className,
}: RichTextEditorProps) {
  const labelId = useId();
  const extensions = useMemo(() => createExtensions(placeholder), [placeholder]);

  const editor = useEditor({
    extensions,
    content: value ?? EMPTY_RICH_TEXT,
    // Required with server rendering: the editor mounts on the client.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text min-h-64 px-4 py-3 outline-none",
        role: "textbox",
        "aria-multiline": "true",
        ...(label ? { "aria-labelledby": labelId } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getJSON() as RichTextDocument),
  });

  const json = useEditorState({
    editor,
    selector: ({ editor }) => (name && editor ? JSON.stringify(editor.getJSON()) : ""),
  });

  return (
    <div className={className}>
      {label && (
        <span id={labelId} className="mb-1.5 block text-small font-medium text-fg">
          {label}
        </span>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-md border bg-surface focus-within:border-focus",
          invalid ? "border-danger" : "border-line-strong",
        )}
      >
        {editor ? (
          <Toolbar editor={editor} onRequestImage={onRequestImage} />
        ) : (
          <div className="h-11 border-b border-line bg-surface-muted" />
        )}
        <EditorContent editor={editor} />
      </div>
      {name && <input type="hidden" name={name} value={json ?? ""} />}
    </div>
  );
}

function Toolbar({ editor, onRequestImage }: { editor: Editor; onRequestImage: ImageRequest }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      paragraph: editor.isActive("paragraph"),
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      link: editor.isActive("link"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  async function editLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = await promptText({
      title: previous ? "Edit link" : "Add link",
      label: "URL",
      placeholder: "https:// or /page",
      initialValue: previous ?? "",
      required: false,
      validate: (value) =>
        value === "" || isSafeUrl(value) ? null : "Enter a valid http(s), mailto: or /path link.",
    });
    if (href === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href === "") chain.unsetLink().run();
    else chain.setLink({ href }).run();
  }

  async function insertImage() {
    const image = await onRequestImage();
    if (image && isSafeImageUrl(image.src)) {
      editor.chain().focus().setImage({ src: image.src, alt: image.alt }).run();
    }
  }

  const c = () => editor.chain().focus();
  const groups: Array<Array<[LucideIcon, string, boolean, () => unknown, boolean?]>> = [
    [
      [Pilcrow, "Paragraph", state.paragraph, () => c().setParagraph().run()],
      [Heading1, "Heading 1", state.h1, () => c().toggleHeading({ level: 1 }).run()],
      [Heading2, "Heading 2", state.h2, () => c().toggleHeading({ level: 2 }).run()],
      [Heading3, "Heading 3", state.h3, () => c().toggleHeading({ level: 3 }).run()],
    ],
    [
      [Bold, "Bold", state.bold, () => c().toggleBold().run()],
      [Italic, "Italic", state.italic, () => c().toggleItalic().run()],
      [Underline, "Underline", state.underline, () => c().toggleUnderline().run()],
      [LinkIcon, "Link", state.link, editLink],
    ],
    [
      [List, "Bulleted list", state.bulletList, () => c().toggleBulletList().run()],
      [ListOrdered, "Numbered list", state.orderedList, () => c().toggleOrderedList().run()],
      [TextQuote, "Quote", state.blockquote, () => c().toggleBlockquote().run()],
      [ImagePlus, "Image", false, insertImage],
    ],
    [
      [Undo2, "Undo", false, () => c().undo().run(), !state.canUndo],
      [Redo2, "Redo", false, () => c().redo().run(), !state.canRedo],
    ],
  ];

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-muted px-2 py-1.5"
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5 pr-1 [&:not(:last-child)]:border-r [&:not(:last-child)]:border-line">
          {group.map(([Icon, title, active, run, disabled]) => (
            <button
              key={title}
              type="button"
              title={title}
              aria-label={title}
              aria-pressed={active}
              disabled={disabled}
              // Keep focus and selection in the editor while clicking.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void run()}
              className={cn(
                "grid size-8 place-items-center rounded-sm text-fg-secondary transition-colors hover:bg-hover hover:text-fg disabled:pointer-events-none disabled:opacity-40",
                active && "bg-elevated text-fg shadow-sm",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
