import { z } from "zod";
import { isSafeImageUrl, isSafeUrl } from "@/lib/security/url";

/**
 * Rich text is stored as a ProseMirror/Tiptap JSON document, never as HTML.
 * This schema is the allow-list of node types, marks and attributes the
 * site supports; anything else is rejected before it reaches the database.
 * The renderer (src/components/editor/rich-text-renderer.tsx) applies the
 * same allow-list again when displaying.
 *
 * To support a new format (e.g. code blocks), enable it in the editor
 * extensions, add it here, and add a case to the renderer.
 */

export const RICH_TEXT_NODES = [
  "doc",
  "paragraph",
  "heading",
  "text",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "image",
  "hardBreak",
] as const;

export const RICH_TEXT_MARKS = ["bold", "italic", "underline", "link"] as const;

export const HEADING_LEVELS = [1, 2, 3] as const;

/** Upper bound on the stored JSON, in characters. */
export const RICH_TEXT_MAX_LENGTH = 500_000;

export type RichTextMark = {
  type: (typeof RICH_TEXT_MARKS)[number];
  attrs?: Record<string, unknown>;
};

export type RichTextNode = {
  type: (typeof RICH_TEXT_NODES)[number];
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
};

export type RichTextDocument = RichTextNode & { type: "doc" };

const markSchema: z.ZodType<RichTextMark> = z
  .object({
    type: z.enum(RICH_TEXT_MARKS),
    attrs: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((mark, ctx) => {
    if (mark.type !== "link") return;
    const href = mark.attrs?.href;
    if (typeof href !== "string" || !isSafeUrl(href)) {
      ctx.addIssue({ code: "custom", message: "A link has an invalid or unsafe URL." });
    }
  });

const nodeSchema: z.ZodType<RichTextNode> = z.lazy(() =>
  z
    .object({
      type: z.enum(RICH_TEXT_NODES),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.array(nodeSchema).max(10_000).optional(),
      marks: z.array(markSchema).max(10).optional(),
      text: z.string().max(50_000).optional(),
    })
    .superRefine((node, ctx) => {
      if (node.type === "heading") {
        const level = node.attrs?.level;
        if (!HEADING_LEVELS.includes(level as 1 | 2 | 3)) {
          ctx.addIssue({ code: "custom", message: "Headings must be H1, H2 or H3." });
        }
      }
      if (node.type === "image") {
        const src = node.attrs?.src;
        if (typeof src !== "string" || !isSafeImageUrl(src)) {
          ctx.addIssue({ code: "custom", message: "An image has an invalid or unsafe URL." });
        }
      }
    }),
);

export const richTextSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(nodeSchema).max(10_000).default([]),
  })
  .refine(
    (doc) => JSON.stringify(doc).length <= RICH_TEXT_MAX_LENGTH,
    "This content is too long.",
  );

export const EMPTY_RICH_TEXT: RichTextDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** Plain text of a document, e.g. for excerpts, reading time or search. */
export function richTextToPlainText(node: RichTextNode | null | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  const inner = (node.content ?? []).map(richTextToPlainText).join(
    node.type === "doc" || node.type === "bulletList" || node.type === "orderedList" ? "\n\n" : "",
  );
  return inner;
}
