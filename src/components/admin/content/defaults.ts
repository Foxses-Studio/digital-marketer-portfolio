import type { FieldDef } from "@/lib/content/fields";

/** Empty values for a new entry, derived from its field descriptors. */
export function defaultsFromFields(fields: FieldDef[]): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.kind) {
      case "text":
        value[field.name] = "";
        break;
      case "boolean":
        value[field.name] = false;
        break;
      case "select":
        value[field.name] = field.options[0]?.value ?? "";
        break;
      case "media":
        value[field.name] = null;
        break;
      case "date":
        value[field.name] = new Date().toISOString().slice(0, 10);
        break;
      case "tags":
      case "numbers":
      case "list":
        value[field.name] = [];
        break;
      case "group":
        value[field.name] = defaultsFromFields(field.fields);
        break;
    }
  }
  return value;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function collectErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) (errors[issue.path.map(String).join(".")] ??= []).push(issue.message);
  return errors;
}
