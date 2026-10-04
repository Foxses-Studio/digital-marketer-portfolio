"use client";

import { useRef, type DependencyList, type RefObject } from "react";
import { motionQueries } from "@/animations/config";
import { gsap, useGSAP } from "@/animations/gsap";

type AnimationSetup<T extends HTMLElement> = (context: {
  scope: T;
  /** Scoped selector helper: `q(".item")` only matches inside the scope. */
  q: (selector: string) => Element[];
}) => void | (() => void);

type Options<T extends HTMLElement> = {
  /** Re-run the animation when these values change. */
  dependencies?: DependencyList;
  /**
   * Optional static setup for visitors who prefer reduced motion, e.g. to
   * make sure content hidden for an entrance is visible.
   */
  reduced?: AnimationSetup<T>;
};

/**
 * Base hook for every GSAP animation. It:
 * - scopes selectors to the returned ref,
 * - only runs `setup` when the visitor allows motion,
 * - reverts all tweens and ScrollTriggers on unmount or dependency change.
 *
 * Usage:
 *   const ref = useScrollAnimation<HTMLElement>(({ q }) => {
 *     gsap.from(q(".item"), { y: 24, autoAlpha: 0, stagger: 0.1 });
 *   });
 *   return <section ref={ref}>...</section>;
 */
export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  setup: AnimationSetup<T>,
  { dependencies = [], reduced }: Options<T> = {},
): RefObject<T | null> {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const element = scope.current;
      if (!element) return;
      const q = gsap.utils.selector(element);
      const mm = gsap.matchMedia();

      mm.add(motionQueries.allowed, () => setup({ scope: element, q }));
      if (reduced) {
        mm.add(motionQueries.reduced, () => reduced({ scope: element, q }));
      }

      return () => mm.revert();
    },
    { scope, dependencies: [...dependencies], revertOnUpdate: true },
  );

  return scope;
}
