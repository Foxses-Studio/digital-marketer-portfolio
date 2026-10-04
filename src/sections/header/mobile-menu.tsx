"use client";

import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { motionQueries } from "@/animations/config";
import { ThemeToggle } from "@/components/theme";
import type { Brand, HeaderData } from "@/lib/cms/site";
import { cn } from "@/lib/utils/cn";
import { BrandMark } from "./brand-mark";
import { isActivePath } from "./links";
import { SmartLink } from "./smart-link";

export const MENU_ID = "site-mobile-menu";

/**
 * Full-screen mobile navigation on a modal <dialog>: focus is trapped,
 * Escape closes it, the page behind is inert and does not scroll. GSAP
 * reveals the panel, staggers the links and brings in the button last;
 * closing plays the same timeline in reverse.
 */
export function MobileMenu({
  brand,
  items,
  cta,
  pathname,
  open,
  onOpenChange,
}: {
  brand: Brand;
  items: HeaderData["items"];
  cta: HeaderData["cta"];
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const element = dialog.current;
      if (!element) return;
      const reduceMotion = window.matchMedia(motionQueries.reduced).matches;
      timeline.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onReverseComplete: () => element.close(),
        })
        .fromTo(
          element,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: reduceMotion ? 0 : 0.6, ease: "power3.inOut" },
        )
        .from("[data-menu-item]", { yPercent: 60, autoAlpha: 0, duration: reduceMotion ? 0 : 0.55, stagger: 0.06 }, reduceMotion ? 0 : "-=0.25")
        .from("[data-menu-footer]", { y: 16, autoAlpha: 0, duration: reduceMotion ? 0 : 0.45 }, reduceMotion ? 0 : "-=0.3");
    },
    { scope: dialog },
  );

  const show = useCallback(() => {
    const element = dialog.current;
    if (!element || element.open) return;
    element.showModal();
    document.documentElement.style.overflow = "hidden";
    timeline.current?.timeScale(1).play(0);
    onOpenChange(true);
  }, [onOpenChange]);

  const hide = useCallback(() => {
    const element = dialog.current;
    if (!element?.open) return;
    onOpenChange(false);
    if (timeline.current) timeline.current.timeScale(1.6).reverse();
    else element.close();
  }, [onOpenChange]);

  // Restore page scroll however the dialog ends up closed.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      onOpenChange(false);
    };
    // Escape: play the closing animation instead of closing instantly.
    const onCancel = (event: Event) => {
      event.preventDefault();
      hide();
    };
    element.addEventListener("close", onClose);
    element.addEventListener("cancel", onCancel);
    return () => {
      element.removeEventListener("close", onClose);
      element.removeEventListener("cancel", onCancel);
      document.documentElement.style.overflow = "";
    };
  }, [hide, onOpenChange]);

  // Close when the layout switches to desktop navigation.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = () => desktop.matches && dialog.current?.open && dialog.current.close();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-haspopup="dialog"
        className="grid size-10 place-items-center rounded-sm text-fg hover:bg-hover lg:hidden"
      >
        <span className="sr-only">Open menu</span>
        <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 7h14M3 13h9" />
        </svg>
      </button>

      <dialog
        ref={dialog}
        id={MENU_ID}
        aria-label="Menu"
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-canvas p-0 text-fg backdrop:bg-transparent open:flex open:flex-col lg:hidden"
      >
        <div className="container-page flex h-[var(--header-height)] shrink-0 items-center justify-between gap-6">
          <BrandMark brand={brand} onNavigate={hide} />
          <button
            type="button"
            onClick={hide}
            autoFocus
            className="grid size-10 place-items-center rounded-sm text-fg hover:bg-hover"
          >
            <span className="sr-only">Close menu</span>
            <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="container-page flex-1 overflow-y-auto pt-6 pb-10">
          <ul className="border-t border-line">
            {items.map((item, index) => {
              const current = isActivePath(item.url, pathname);
              return (
                <li key={item.id} className="overflow-hidden border-b border-line">
                  <SmartLink
                    href={item.url}
                    newTab={item.newTab}
                    current={current}
                    onClick={hide}
                    className="group/item flex items-baseline gap-4 py-5"
                  >
                    <span data-menu-item className="flex w-full items-baseline gap-4">
                      <span className="w-6 shrink-0 text-label text-fg-muted tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-[clamp(1.75rem,8vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors",
                          current ? "text-fg" : "text-fg-secondary group-hover/item:text-fg",
                        )}
                      >
                        {item.label}
                      </span>
                      {current && <span aria-hidden className="ml-auto size-1.5 self-center rounded-full bg-accent" />}
                    </span>
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div data-menu-footer className="container-page shrink-0 space-y-5 border-t border-line pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {cta && (
            <SmartLink
              href={cta.url}
              newTab={cta.newTab}
              onClick={hide}
              className="flex h-12 w-full items-center justify-between rounded-sm bg-button-primary px-5 text-button text-button-primary-fg transition-colors hover:bg-button-primary-hover"
            >
              {cta.label}
              <ArrowUpRight aria-hidden className="size-4" />
            </SmartLink>
          )}
          <div className="flex items-center justify-between">
            <span className="text-label text-fg-muted">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </dialog>
    </>
  );
}
