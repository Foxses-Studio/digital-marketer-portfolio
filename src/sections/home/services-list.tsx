"use client";

import { Plus } from "lucide-react";
import { useId, useRef, useState } from "react";
import { pointerQuery } from "@/animations/config";
import { gsap, useGSAP } from "@/animations/gsap";
import { cn } from "@/lib/utils/cn";

export type ServiceItem = {
  id: string;
  title: string;
  summary: string;
  description: string;
  metricValue: string;
  metricLabel: string;
  tags: string[];
};

/**
 * Services: on large screens a list whose hover/focus drives the detail
 * panel beside it (an accent marker glides to the active row); on smaller
 * screens an accordion. Both are real buttons with ARIA state.
 */
export function ServicesList({ services }: { services: ServiceItem[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(0);
  const baseId = useId();

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const rows = scope.querySelectorAll<HTMLElement>("[data-service-row]");
      const marker = scope.querySelector<HTMLElement>("[data-service-marker]");
      const row = rows[active];
      if (marker && row) {
        gsap.to(marker, { y: row.offsetTop, height: row.offsetHeight, duration: 0.6, ease: "dm.inOut", overwrite: true });
      }
      const panels = scope.querySelectorAll<HTMLElement>("[data-service-panel]");
      const from = panels[previous.current];
      const to = panels[active];
      if (!to || from === to) return;
      const direction = active > previous.current ? 1 : -1;
      previous.current = active;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (from) gsap.to(from, { autoAlpha: 0, y: -24 * direction, duration: 0.35, ease: "dm.soft", overwrite: true });
        gsap.fromTo(
          to.querySelectorAll("[data-panel-part]"),
          { y: 28 * direction, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: "dm.out", overwrite: true },
        );
        gsap.set(to, { autoAlpha: 1, y: 0 });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (from) gsap.set(from, { autoAlpha: 0 });
        gsap.set(to, { autoAlpha: 1, y: 0 });
      });
    },
    { scope: root, dependencies: [active] },
  );

  // Rows enter with a staggered line draw once.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-service-row]", {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.06,
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        });
      });
      // Pointer: the panel leans slightly toward the cursor.
      mm.add(pointerQuery, () => {
        const panel = root.current?.querySelector<HTMLElement>("[data-service-stage]");
        if (!panel) return;
        const rx = gsap.quickTo(panel, "rotationY", { duration: 0.8, ease: "dm.soft" });
        const ry = gsap.quickTo(panel, "rotationX", { duration: 0.8, ease: "dm.soft" });
        const move = (event: PointerEvent) => {
          const box = panel.getBoundingClientRect();
          rx(((event.clientX - box.left) / box.width - 0.5) * 4);
          ry(-((event.clientY - box.top) / box.height - 0.5) * 4);
        };
        const reset = () => {
          rx(0);
          ry(0);
        };
        panel.addEventListener("pointermove", move);
        panel.addEventListener("pointerleave", reset);
        return () => {
          panel.removeEventListener("pointermove", move);
          panel.removeEventListener("pointerleave", reset);
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mt-14 grid gap-x-[clamp(3rem,6vw,7rem)] lg:mt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* List / accordion */}
      <ol className="relative border-t border-line">
        <span data-service-marker aria-hidden className="absolute top-0 left-0 hidden w-0.5 bg-accent lg:block" style={{ height: 0 }} />
        {services.map((service, i) => {
          const panelId = `${baseId}-${i}`;
          const expanded = open === i;
          return (
            <li key={service.id} data-service-row className="border-b border-line">
              {/* Large screens: hover/focus selects */}
              <button
                type="button"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                aria-controls={`${baseId}-panel`}
                className="group hidden w-full grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-4 py-6 pl-6 text-left lg:grid"
              >
                <span className={cn("text-label tabular-nums transition-colors duration-300", active === i ? "text-accent" : "text-fg-muted")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className={cn("block text-h3 transition-[color,transform] duration-500 ease-[var(--ease-out-expo)]", active === i ? "translate-x-1.5 text-fg" : "text-fg-secondary group-hover:text-fg")}>
                    {service.title}
                  </span>
                  <span className="mt-1.5 block text-small text-fg-muted">{service.summary}</span>
                </span>
              </button>

              {/* Small screens: accordion */}
              <div className="lg:hidden">
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-5 text-left"
                  >
                    <span className={cn("text-label tabular-nums", expanded ? "text-accent" : "text-fg-muted")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[1.1875rem] leading-snug font-semibold tracking-[-0.015em] text-fg">{service.title}</span>
                    <Plus aria-hidden className={cn("size-5 text-fg-muted transition-transform duration-500 ease-[var(--ease-out-expo)]", expanded && "rotate-45 text-accent")} />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-label={service.title}
                  className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden" inert={!expanded}>
                    <div className="pb-6 pl-[3rem]">
                      <p className="text-body text-fg-secondary">{service.description || service.summary}</p>
                      {service.metricValue && (
                        <p className="mt-4 flex items-baseline gap-2">
                          <span className="font-display text-[1.75rem] font-semibold tracking-[-0.04em] text-accent">{service.metricValue}</span>
                          <span className="text-small text-fg-muted">{service.metricLabel}</span>
                        </p>
                      )}
                      {service.tags.length > 0 && <Tags tags={service.tags} />}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Detail panel (large screens) */}
      <div className="hidden lg:block [perspective:1200px]">
        <div
          id={`${baseId}-panel`}
          data-service-stage
          aria-live="polite"
          className="sticky top-[calc(var(--header-height)+2rem)] grid min-h-[26rem] overflow-hidden rounded-sm border border-line bg-canvas"
        >
          {services.map((service, i) => (
            <article
              key={service.id}
              data-service-panel
              aria-hidden={active !== i}
              className={cn("col-start-1 row-start-1 flex flex-col p-[clamp(2rem,3vw,3rem)]", active !== i && "invisible")}
            >
              <div data-panel-part className="flex items-start justify-between gap-6">
                <span aria-hidden className="font-serif text-[5.5rem] leading-[0.8] text-accent italic">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {service.metricValue && (
                  <p className="text-right">
                    <span className="block font-display text-[2.75rem] leading-none font-semibold tracking-[-0.05em] text-fg">{service.metricValue}</span>
                    <span className="mt-2 block text-label text-fg-muted">{service.metricLabel}</span>
                  </p>
                )}
              </div>
              <h3 data-panel-part className="mt-auto pt-12 text-h2">{service.title}</h3>
              <p data-panel-part className="mt-4 max-w-[34rem] text-body-lg text-fg-secondary">{service.description || service.summary}</p>
              {service.tags.length > 0 && (
                <div data-panel-part>
                  <Tags tags={service.tags} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-line-strong px-3 py-1.5 text-small text-fg-secondary">
          {tag}
        </li>
      ))}
    </ul>
  );
}
