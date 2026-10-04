import { formatMetricNumber } from "@/lib/metrics";
import { gsap } from "./gsap";

/**
 * Counts a `[data-count]` element up from zero to its stored value,
 * keeping prefix, suffix, decimals and thousands separators intact.
 * Returns the tween so it can be placed on a timeline.
 */
export function countUp(element: HTMLElement, vars: gsap.TweenVars = {}) {
  const target = Number(element.dataset.count);
  if (!Number.isFinite(target)) return null;
  const decimals = Number(element.dataset.decimals ?? 0);
  const prefix = element.dataset.prefix ?? "";
  const suffix = element.dataset.suffix ?? "";
  const state = { value: 0 };
  const render = () => {
    element.textContent = `${prefix}${formatMetricNumber(state.value, decimals)}${suffix}`;
  };
  render();
  return gsap.to(state, {
    value: target,
    duration: 1.8,
    ease: "expo.out",
    onUpdate: render,
    onComplete: () => {
      state.value = target;
      render();
    },
    ...vars,
  });
}
