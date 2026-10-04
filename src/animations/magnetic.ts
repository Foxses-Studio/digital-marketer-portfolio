import { gsap } from "./gsap";

/**
 * Magnetic hover: the element leans toward the pointer and its inner
 * content leans a little further, then both settle back. Returns a cleanup
 * function. Call only on fine-pointer desktops (see pointerQuery).
 */
export function magnetic(element: HTMLElement, { strength = 0.28, max = 10 } = {}) {
  const inner = element.querySelector<HTMLElement>("[data-magnetic-inner]");
  const moveX = gsap.quickTo(element, "x", { duration: 0.6, ease: "dm.soft" });
  const moveY = gsap.quickTo(element, "y", { duration: 0.6, ease: "dm.soft" });
  const innerX = inner ? gsap.quickTo(inner, "x", { duration: 0.6, ease: "dm.soft" }) : null;
  const innerY = inner ? gsap.quickTo(inner, "y", { duration: 0.6, ease: "dm.soft" }) : null;
  const clamp = gsap.utils.clamp(-max, max);

  const onMove = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    moveX(clamp(dx * strength));
    moveY(clamp(dy * strength));
    innerX?.(clamp(dx * strength * 0.45));
    innerY?.(clamp(dy * strength * 0.45));
  };
  const onLeave = () => {
    gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: true });
    if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: true });
  };

  element.addEventListener("pointermove", onMove);
  element.addEventListener("pointerleave", onLeave);
  return () => {
    element.removeEventListener("pointermove", onMove);
    element.removeEventListener("pointerleave", onLeave);
    gsap.set([element, inner].filter(Boolean), { clearProps: "transform" });
  };
}
