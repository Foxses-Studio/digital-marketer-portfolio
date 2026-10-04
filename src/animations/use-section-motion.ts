"use client";

import type { RefObject } from "react";
import { motionQueries } from "./config";
import { gsap, useGSAP } from "./gsap";
import { revealIntro } from "./reveal";

/** Elements whose inline motion styles are cleared when motion turns off. */
const RESET_SELECTOR =
  "[data-case], [data-case-copy], [data-case-cover], .cases-cover-image, [data-cases-tick], [data-result-slide], [data-result-bar], [data-results-line], [data-results-dot]";

/**
 * Motion scaffold shared by homepage sections:
 *  - reveals the section intro ([data-split] headings, [data-fade] copy)
 *  - runs the section's own setup when motion is allowed
 *  - marks the section ready, lifting the CSS pre-hide (see motion.css)
 * Everything created in `setup` (tweens, ScrollTriggers, nested
 * matchMedia) is reverted on unmount or when reduced motion turns on.
 */
export function useSectionMotion(
  ref: RefObject<HTMLElement | null>,
  setup?: (scope: HTMLElement) => void | (() => void),
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const scope = ref.current;
      if (!scope) return;
      const mm = gsap.matchMedia();
      mm.add(motionQueries.allowed, () => {
        const undoIntro = revealIntro(scope);
        const undo = setup?.(scope);
        return () => {
          undoIntro();
          undo?.();
        };
      });
      // Switching to reduced motion mid-visit: make sure stacked/pinned
      // stages don't keep a hidden or clipped state from their timelines.
      mm.add(motionQueries.reduced, () => {
        gsap.set(scope.querySelectorAll(RESET_SELECTOR), { clearProps: "all" });
      });
      scope.dataset.motion = "ready";
      return () => mm.revert();
    },
    { scope: ref, dependencies },
  );
}
