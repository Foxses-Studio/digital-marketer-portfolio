/** Link helpers shared by the desktop and mobile navigation. */

export function isInternalPath(url: string) {
  return url.startsWith("/") && !url.startsWith("//");
}

/** Whether a menu URL is the current page. Home matches only exactly. */
export function isActivePath(url: string, pathname: string) {
  if (!isInternalPath(url)) return false;
  const path = url.split(/[?#]/)[0] || "/";
  if (path === "/") return pathname === "/";
  const normalized = path.replace(/\/+$/, "");
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

export function externalProps(newTab: boolean) {
  return newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
