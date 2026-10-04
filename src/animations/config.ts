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
  ease: {
    out: "power3.out",
    outStrong: "expo.out",
    inOut: "power2.inOut",
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
