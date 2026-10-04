"use client";

import { useRef, type ReactNode } from "react";
import { countUp } from "@/animations/counter";
import { motionQueries, pointerQuery } from "@/animations/config";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/animations/gsap";
import { magnetic } from "@/animations/magnetic";

/**
 * Motion layer for the server-rendered hero. Three independent systems,
 * each on its own wrapper so transforms never conflict:
 *  1. Entrance  (once): label wipe → masked headline lines → copy → CTAs,
 *     visual plane → portrait reveal → curve draws → results count up.
 *  2. Scroll exit (scrubbed, no pinning): copy lifts and recedes, visual
 *     layers separate at different speeds, the portrait scales slightly.
 *  3. Pointer depth + magnetic CTAs (fine-pointer desktops only).
 * Everything reverts on unmount; reduced motion gets a static hero.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      const hero = scope?.querySelector<HTMLElement>("[data-hero]");
      if (!scope || !hero) return;
      const q = gsap.utils.selector(scope);
      const mm = gsap.matchMedia();

      // ------------------------------------------------------------ entrance
      mm.add(motionQueries.allowed, () => {
        const tl = gsap.timeline({ defaults: { ease: "dm.out" }, delay: 0.15 });
        const heading = q<HTMLElement>('[data-reveal="heading"]')[0];

        tl.addLabel("copy", 0).addLabel("visual", 0.3);

        tl.fromTo(
          q('[data-reveal="eyebrow"]'),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "dm.inOut" },
          "copy",
        );

        let split: SplitText | null = null;
        if (heading) {
          let played = false;
          split = SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            linesClass: "hero-line",
            autoSplit: true,
            // Re-splits on resize/font load keep the animation's progress.
            onSplit(self) {
              const tween = gsap.from(self.lines, {
                yPercent: 112,
                rotate: 1.2,
                transformOrigin: "0% 100%",
                duration: 1.25,
                ease: "dm.reveal",
                stagger: 0.085,
                delay: played ? 0 : 0.35,
              });
              played = true;
              return tween;
            },
          });
        }

        tl.from(q('[data-reveal="description"]'), { y: 22, autoAlpha: 0, duration: 1.1 }, "copy+=0.85")
          .from(q('[data-reveal="cta"]'), { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.09 }, "copy+=1.0")
          .from(q('[data-reveal="availability"]'), { autoAlpha: 0, y: 10, duration: 0.8 }, "copy+=1.2");

        // Visual. On desktop it plays as part of the entrance; where it
        // starts below the fold (mobile, tablet) it plays when scrolled to.
        const visualRoot = q<HTMLElement>("[data-hero-visual]")[0];
        const inVisual = (element: Element) => !!visualRoot?.contains(element);
        const visualBelowFold = !!visualRoot && visualRoot.getBoundingClientRect().top > window.innerHeight * 0.85;
        const vt = visualBelowFold ? gsap.timeline({ paused: true, defaults: { ease: "dm.out" } }) : tl;
        const at = (offset: number) => (visualBelowFold ? offset : `visual+=${offset}`);

        vt.fromTo(
          q('[data-reveal="plane"]'),
          { clipPath: "inset(100% 0% 0% 0% round 6px)" },
          { clipPath: "inset(0% 0% 0% 0% round 6px)", duration: 1.2, ease: "dm.inOut" },
          at(0),
        )
          .fromTo(
            q('[data-reveal="portrait"]'),
            { clipPath: "inset(100% 0% 0% 0% round 6px)" },
            { clipPath: "inset(0% 0% 0% 0% round 6px)", duration: 1.35, ease: "dm.reveal" },
            at(0.2),
          )
          .from(q("[data-hero-image]"), { scale: 1.22, duration: 2, ease: "dm.reveal" }, at(0.2))
          // The curve draws left to right (a clip, so the stroke can stay
          // non-scaling inside the stretched chart).
          .fromTo(
            q("[data-chart-line]"),
            { clipPath: "inset(-10% 100% -10% 0%)" },
            { clipPath: "inset(-10% 0% -10% 0%)", duration: 1.6, ease: "dm.inOut" },
            at(0.75),
          )
          .from(q("[data-chart-area]"), { autoAlpha: 0, duration: 1.2, ease: "sine.out" }, at(1.5))
          // Points pop as the line reaches them.
          .from(
            q("[data-chart-dot]"),
            { scale: 0, transformOrigin: "50% 50%", duration: 0.55, ease: "back.out(2.4)", stagger: 0.36 },
            at(1.5),
          )
          .from(q('[data-reveal="plate"]'), { y: 48, autoAlpha: 0, duration: 1.2, ease: "dm.reveal" }, at(0.95))
          .from(q("[data-plate-bar]"), { scaleX: 0, duration: 1.4, ease: "dm.inOut" }, at(1.35))
          .from(q("[data-ledger-row]").filter(inVisual), { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, at(1.15))
          .from(q("[data-reveal-fade]"), { autoAlpha: 0, duration: 1, ease: "sine.out" }, at(1.3));

        // Results inside the visual count up as they land.
        q<HTMLElement>("[data-count]")
          .filter((element) => inVisual(element) && element.offsetParent)
          .forEach((element, index) => {
            const tween = countUp(element);
            if (tween) vt.add(tween, at(1.05 + index * 0.12));
          });

        if (visualBelowFold && visualRoot) {
          ScrollTrigger.create({ trigger: visualRoot, start: "top 82%", once: true, onEnter: () => vt.play() });
        }

        // Results under the visual (small screens) reveal on their own.
        q<HTMLElement>("[data-ledger-row]")
          .filter((row) => !inVisual(row) && row.offsetParent)
          .forEach((row, index) => {
            const reveal = gsap.timeline({ paused: true });
            reveal.from(row, { y: 16, autoAlpha: 0, duration: 0.9, delay: (index % 3) * 0.08 }, 0);
            const counter = row.querySelector<HTMLElement>("[data-count]");
            const tween = counter ? countUp(counter) : null;
            if (tween) reveal.add(tween, 0.15 + (index % 3) * 0.08);
            ScrollTrigger.create({ trigger: row, start: "top 90%", once: true, onEnter: () => reveal.play() });
          });

        // States are set; hand visibility over from CSS to GSAP.
        hero.dataset.motion = "ready";

        return () => {
          split?.revert();
          delete hero.dataset.motion;
        };
      });

      // Reduced motion: final state, nothing hidden.
      mm.add(motionQueries.reduced, () => {
        hero.dataset.motion = "ready";
      });

      // ---------------------------------------------------------- scroll exit
      mm.add(
        {
          desktop: "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 63.999rem) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean; mobile: boolean };
          const factor = desktop ? 1 : 0.45;
          const exit = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: 0, end: "bottom top", scrub: 0.9 },
          });
          exit.to(q("[data-scroll-speed]"), { y: (_i, el: HTMLElement) => Number(el.dataset.scrollSpeed) * factor * 1.6 }, 0)
            .to(q("[data-hero-image]"), { scale: 1.09 }, 0);
          if (desktop) {
            exit.to(q('[data-scroll="heading"]'), { yPercent: -22 }, 0)
              .to(q('[data-scroll="support"]'), { y: -70, autoAlpha: 0.15 }, 0);
          }
          return () => exit.scrollTrigger?.kill();
        },
      );

      // ------------------------------------------------- pointer + magnetic
      mm.add(pointerQuery, () => {
        const layers = q<HTMLElement>("[data-depth]").map((element) => ({
          depth: Number(element.dataset.depth),
          x: gsap.quickTo(element, "x", { duration: 1.1, ease: "power3.out" }),
          y: gsap.quickTo(element, "y", { duration: 1.1, ease: "power3.out" }),
        }));

        const onMove = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          for (const layer of layers) {
            layer.x(nx * layer.depth);
            layer.y(ny * layer.depth * 0.7);
          }
        };
        const onLeave = () => layers.forEach((layer) => (layer.x(0), layer.y(0)));
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerleave", onLeave);

        const cleanups = q<HTMLElement>('[data-reveal="cta"] > a').map((element) => magnetic(element));

        return () => {
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerleave", onLeave);
          cleanups.forEach((cleanup) => cleanup());
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // Make sure scroll positions are right once images and fonts settle.
  useGSAP(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  });

  return <div ref={root}>{children}</div>;
}
