"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "./theme-provider";

/**
 * Single-button light/dark switch for the public header. Icons and labels
 * are chosen by CSS from the theme attribute set before paint, so the
 * correct state shows immediately with no hydration mismatch. Visitors who
 * never click keep following their system theme.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { setPreference } = useTheme();

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    setPreference(current === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "group/theme relative grid size-10 place-items-center rounded-sm text-fg-secondary transition-colors hover:bg-hover hover:text-fg",
        className,
      )}
    >
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
      <Moon
        aria-hidden
        className="size-[1.125rem] transition-transform duration-300 group-hover/theme:-rotate-12 dark:hidden"
        strokeWidth={1.75}
      />
      <Sun
        aria-hidden
        className="hidden size-[1.125rem] transition-transform duration-500 group-hover/theme:rotate-45 dark:block"
        strokeWidth={1.75}
      />
    </button>
  );
}
