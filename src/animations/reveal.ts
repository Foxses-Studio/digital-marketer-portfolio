import { gsap, ScrollTrigger, SplitText } from "./gsap";

/**
 * Shared reveal for section intros: masked line reveal for [data-split]
 * headings, a soft rise for [data-fade] elements. Triggered once when the
 * intro enters. Returns a cleanup that reverts the split.
 */
export function revealIntro(scope: Element, start = "top 82%") {
  const splits: SplitText[] = [];
  scope.querySelectorAll<HTMLElement>("[data-split]").forEach((heading) => {
    const split = SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      linesClass: "reveal-line",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: "dm.reveal",
          stagger: 0.08,
          scrollTrigger: { trigger: heading, start, once: true },
        });
      },
    });
    splits.push(split);
  });
  const fades = scope.querySelectorAll<HTMLElement>("[data-fade]");
  if (fades.length) {
    gsap.from(fades, {
      y: 18,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.08,
      scrollTrigger: { trigger: fades[0]!, start, once: true },
    });
  }
  return () => splits.forEach((split) => split.revert());
}

/** Refresh trigger positions after images/fonts settle. */
export function refreshOnLoad() {
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  return () => window.removeEventListener("load", refresh);
}
