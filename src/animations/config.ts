/**
 * Shared motion values so every animation on the site has the same feel.
 * Mirrors the CSS easing tokens in src/styles/tokens.css.
 */
export const motion = {
  duration: {
    fast: 0.4,
    base: 0.9,
    slow: 1.4,
  },
  /** Custom eases registered in ./gsap.ts. */
  ease: {
    reveal: "dm.reveal",
    out: "dm.out",
    inOut: "dm.inOut",
    soft: "dm.soft",
  },
  stagger: {
    tight: 0.06,
    base: 0.1,
    loose: 0.16,
  },
  /** Typical vertical travel for reveal animations, in pixels. */
  distance: 32,
  /** Where scroll-triggered entrances start: element top hits 85% of the viewport. */
  scrollStart: "top 85%",
} as const;

/** Media query conditions for gsap.matchMedia(). */
export const motionQueries = {
  allowed: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

/** Desktop with a precise pointer: where pointer-driven effects run. */
export const pointerQuery =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
