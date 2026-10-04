import type { FieldDef } from "@/lib/content/fields";

/** Field descriptors shared by section editors. */
export const headerFields = (opts: { description?: boolean } = {}): FieldDef[] => [
  { kind: "text", name: "label", label: "Label", max: 40, half: true, hint: "Small text above the heading." },
  { kind: "text", name: "heading", label: "Heading", max: 120 },
  { kind: "text", name: "highlight", label: "Highlighted words", max: 60, hint: "Words from the heading shown in the accent style." },
  ...(opts.description === false
    ? []
    : [{ kind: "text", name: "description", label: "Description", max: 300, rows: 2 } as FieldDef]),
];

export const ctaField = (name: string, label: string): FieldDef => ({
  kind: "group",
  name,
  label,
  fields: [
    { kind: "boolean", name: "enabled", label: "Show button" },
    { kind: "text", name: "label", label: "Label", max: 32, half: true },
    { kind: "text", name: "url", label: "Link", half: true, placeholder: "/contact" },
  ],
});

export const limitField = (min: number, max: number, label = "Items to show"): FieldDef => ({
  kind: "select",
  name: "limit",
  label,
  half: true,
  options: Array.from({ length: max - min + 1 }, (_, i) => ({ value: String(min + i), label: String(min + i) })),
});
