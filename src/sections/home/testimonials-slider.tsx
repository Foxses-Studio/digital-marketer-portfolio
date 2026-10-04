"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/animations/gsap";
import { cn } from "@/lib/utils/cn";

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: { url: string } | null;
};

const AUTOPLAY_SECONDS = 8;

/**
 * Testimonial slider. Quotes change with a masked line transition; the
 * progress bar shows the autoplay timer. Autoplay pauses on hover, focus,
 * when off screen and when the visitor presses pause, and never runs with
 * reduced motion. Arrow keys, buttons and swipes navigate.
 */
export function TestimonialsSlider({ testimonials, label }: { testimonials: Testimonial[]; label: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const previous = useRef(0);
  const count = testimonials.length;

  const go = useCallback((next: number) => setActive(((next % count) + count) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Slide transition.
  useGSAP(
    () => {
      const slides = root.current?.querySelectorAll<HTMLElement>("[data-slide]");
      if (!slides) return;
      const from = slides[previous.current];
      const to = slides[active];
      if (!to) return;
      const direction = active >= previous.current ? 1 : -1;
      const changed = from !== to;
      previous.current = active;
      if (!changed) return;
      if (reduced) {
        gsap.set(from ?? [], { autoAlpha: 0 });
        gsap.set(to, { autoAlpha: 1 });
        return;
      }
      const quote = to.querySelector<HTMLElement>("[data-slide-quote]");
      const tl = gsap.timeline();
      if (from) tl.to(from, { autoAlpha: 0, y: -16 * direction, duration: 0.4, ease: "dm.soft" });
      tl.set(to, { autoAlpha: 1, y: 0 });
      if (quote) {
        const split = SplitText.create(quote, { type: "lines", mask: "lines" });
        tl.from(split.lines, { yPercent: 105 * direction, duration: 0.95, stagger: 0.06, ease: "dm.reveal" }, "-=0.05").add(() => split.revert());
      }
      tl.from(to.querySelectorAll("[data-slide-meta]"), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.06 }, "-=0.6");
    },
    { scope: root, dependencies: [active, reduced] },
  );

  // Autoplay progress.
  const running = count > 1 && !reduced && !paused && !hovered && visible;
  useGSAP(
    () => {
      const bar = root.current?.querySelector<HTMLElement>("[data-progress]");
      if (!bar || count < 2) return;
      progress.current?.kill();
      if (reduced) {
        gsap.set(bar, { scaleX: (active + 1) / count });
        return;
      }
      progress.current = gsap.fromTo(
        bar,
        { scaleX: 0 },
        { scaleX: 1, duration: AUTOPLAY_SECONDS, ease: "none", paused: true, onComplete: () => go(active + 1) },
      );
    },
    { scope: root, dependencies: [active, reduced, count] },
  );

  useEffect(() => {
    const tween = progress.current;
    if (!tween) return;
    if (running) tween.play();
    else tween.pause();
  }, [running, active]);

  // Swipe.
  const start = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") start.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const origin = start.current;
    start.current = null;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(event.clientY - origin.y)) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="mt-14 lg:mt-20"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovered(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(active + 1);
        if (event.key === "ArrowLeft") go(active - 1);
      }}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-[clamp(3rem,6vw,7rem)]">
        <p aria-hidden data-quote-mark className="hidden font-serif text-[clamp(8rem,14vw,13rem)] leading-[0.7] text-accent italic select-none lg:block">
          &ldquo;
        </p>
        <div>
          <div className="grid touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp} aria-live={running ? "off" : "polite"}>
            {testimonials.map((item, i) => (
              <figure
                key={item.id}
                data-slide
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={active !== i}
                className={cn("col-start-1 row-start-1", active !== i && "invisible")}
              >
                <blockquote data-slide-quote className="testimonial-quote text-fg">
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <span data-slide-meta className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-muted text-small font-semibold text-fg-secondary">
                    {item.avatar ? (
                      <Image src={item.avatar.url} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      item.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")
                    )}
                  </span>
                  <span data-slide-meta>
                    <span className="block text-body font-semibold text-fg">{item.name}</span>
                    <span className="block text-small text-fg-muted">{[item.role, item.company].filter(Boolean).join(", ")}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          {count > 1 && (
            <div className="mt-12 flex items-center gap-5 border-t border-line pt-6">
              <span className="text-label tabular-nums text-fg-muted">
                <span className="text-fg">{String(active + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
              </span>
              <span aria-hidden className="relative h-px flex-1 overflow-hidden bg-line">
                <span data-progress className="absolute inset-0 origin-left scale-x-0 bg-accent" />
              </span>
              <div className="flex items-center gap-2">
                {!reduced && (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
                    className="grid size-11 place-items-center rounded-full text-fg-secondary transition-colors hover:bg-hover hover:text-fg"
                  >
                    {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go(active - 1)}
                  aria-label="Previous testimonial"
                  className="grid size-11 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-fg hover:bg-fg hover:text-canvas"
                >
                  <ArrowLeft aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(active + 1)}
                  aria-label="Next testimonial"
                  className="grid size-11 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-fg hover:bg-fg hover:text-canvas"
                >
                  <ArrowRight aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
