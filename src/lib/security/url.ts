/**
 * URL allow-listing for anything an admin can type that ends up in an
 * href or src. Blocks `javascript:`, `data:`, `vbscript:` and other
 * schemes that could execute script. Pure; safe on client and server.
 */

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

function isRelative(value: string) {
  // "/path" or "#anchor", but not protocol-relative "//host".
  return (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) ||
    value.startsWith("#");
}

function protocolOf(value: string): string | null {
  try {
    return new URL(value).protocol;
  } catch {
    return null;
  }
}

/** Safe for `<a href>`. */
export function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\s]/.test(trimmed)) return false;
  if (isRelative(trimmed)) return true;
  const protocol = protocolOf(trimmed);
  return protocol !== null && LINK_PROTOCOLS.has(protocol);
}

/** Safe for `<img src>`. */
export function isSafeImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\s]/.test(trimmed)) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  const protocol = protocolOf(trimmed);
  return protocol !== null && IMAGE_PROTOCOLS.has(protocol);
}

export function isExternalUrl(value: string): boolean {
  const protocol = protocolOf(value);
  return protocol === "http:" || protocol === "https:";
}
