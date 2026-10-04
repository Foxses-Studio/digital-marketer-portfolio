"use client";

import { ArrowUp } from "lucide-react";

/** Scrolls to the top and moves focus to the start of the main content. */
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className="group/top inline-flex min-h-11 items-center gap-2 self-start text-feature-fg/85 transition-colors hover:text-accent"
    >
      Back to top
      <ArrowUp aria-hidden className="size-4 transition-transform duration-300 group-hover/top:-translate-y-0.5" />
    </button>
  );
}
