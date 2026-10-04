/**
 * Field descriptors: a small, declarative description of an editable
 * form, attached to a Zod schema. The admin renders forms from these
 * (src/components/admin/content/fields-editor.tsx), so every section and
 * collection gets a consistent editor without bespoke form code. The Zod
 * schema stays the single source of validation.
 */

type Base = {
  /** Property name (relative to the parent object). */
  name: string;
  label: string;
  hint?: string;
  /** Half-width on wide forms. */
  half?: boolean;
};

export type FieldDef =
  | (Base & { kind: "text"; max?: number; placeholder?: string; rows?: number })
  | (Base & { kind: "number"; placeholder?: string; step?: number })
  | (Base & { kind: "boolean" })
  | (Base & { kind: "media"; preview?: "wide" | "square" })
  | (Base & { kind: "select"; options: ReadonlyArray<{ value: string; label: string }> })
  | (Base & { kind: "date" })
  | (Base & { kind: "richtext"; placeholder?: string })
  | (Base & { kind: "tags"; max: number; placeholder?: string })
  | (Base & { kind: "numbers"; max: number; placeholder?: string })
  | (Base & { kind: "group"; fields: FieldDef[] })
  | (Base & {
      kind: "list";
      max: number;
      itemLabel: string;
      /** Field shown as each item's title in the collapsed list. */
      titleField: string;
      fields: FieldDef[];
      /** Default value for a new item (id is added automatically). */
      newItem: Record<string, unknown>;
    });

export type FieldGroup = { title: string; description?: string; fields: FieldDef[] };

/** Reads a dotted path from an object. */
export function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
}

/** Returns a copy of `value` with the dotted path set. */
export function setPath<T>(value: T, path: string, next: unknown): T {
  const [head, ...rest] = path.split(".");
  const source = (value ?? {}) as Record<string, unknown> | unknown[];
  const copy: Record<string, unknown> | unknown[] = Array.isArray(source) ? [...source] : { ...source };
  const key = Array.isArray(copy) ? Number(head) : head!;
  (copy as Record<string | number, unknown>)[key] = rest.length
    ? setPath((source as Record<string | number, unknown>)[key], rest.join("."), next)
    : next;
  return copy as T;
}

/** Every media id referenced by `value` according to `fields`. */
export function collectMediaIds(fields: FieldDef[], value: unknown): string[] {
  const ids: string[] = [];
  for (const field of fields) {
    const current = getPath(value, field.name);
    if (field.kind === "media" && typeof current === "string" && current) ids.push(current);
    if (field.kind === "group") ids.push(...collectMediaIds(field.fields, current));
    if (field.kind === "list" && Array.isArray(current)) {
      for (const item of current) ids.push(...collectMediaIds(field.fields, item));
    }
  }
  return ids;
}
