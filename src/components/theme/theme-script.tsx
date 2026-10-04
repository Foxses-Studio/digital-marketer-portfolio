import { THEME_STORAGE_KEY } from "./theme-config";

/**
 * Applies the stored theme to <html> while the document is being parsed,
 * before first paint, so the wrong theme never flashes. Must be rendered
 * inside <head> of the root layout.
 *
 * The `type` swap keeps React from warning about rendering a <script> on
 * the client; the browser only executes it from the server HTML.
 */
const script = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var t=p==="light"||p==="dark"?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t}catch(e){}})()`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
