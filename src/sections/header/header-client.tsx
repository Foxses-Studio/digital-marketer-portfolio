"use client";

import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/animations/gsap";
import { motionQueries } from "@/animations/config";
import { ThemeSwitch } from "@/components/theme";
import type { HeaderData } from "@/lib/cms/site";
import { cn } from "@/lib/utils/cn";
import { BrandMark } from "./brand-mark";
import { isActivePath } from "./links";
import { MENU_ID, MobileMenu } from "./mobile-menu";
import { SmartLink } from "./smart-link";

/** Distance scrolled before the header switches to its compact state. */
const SCROLLED_AT = 12;
/** Don't hide the header until the visitor is past the top of the page. */
const HIDE_AFTER = 160;

/**
 * Interactive part of the public header. Content comes from the CMS
 * (server-fetched, passed in); this component only adds behavior:
 * scroll state, hide-on-scroll, active link and the mobile menu.
 */
export function HeaderClient({ data }: { data: HeaderData }) {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { brand, items, cta, sticky, hideOnScroll } = data;

  useGSAP(
    () => {
      const element = header.current;
      if (!element || !sticky) return;

      const reduceMotion = window.matchMedia(motionQueries.reduced).matches;
      let hidden = false;
      const setHidden = (next: boolean) => {
        if (next === hidden) return;
        hidden = next;
        element.dataset.hidden = String(next);
        gsap.to(element, {
          yPercent: next ? -100 : 0,
          duration: reduceMotion ? 0 : 0.45,
          ease: next ? "power2.in" : "power3.out",
          overwrite: true,
        });
      };

      const update = (scroll: number, direction: number) => {
        element.dataset.scrolled = String(scroll > SCROLLED_AT);
        if (!hideOnScroll) return;
        // Never hide while keyboard focus is in the header or the menu is open.
        const menuIsOpen = document.getElementById(MENU_ID)?.hasAttribute("open") ?? false;
        const keepVisible = menuIsOpen || element.contains(document.activeElement);
        if (keepVisible || scroll < HIDE_AFTER) setHidden(false);
        else if (direction === 1) setHidden(true);
        else if (direction === -1) setHidden(false);
      };

      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => update(self.scroll(), self.direction),
      });
      update(window.scrollY, 0);

      const onFocus = () => setHidden(false);
      element.addEventListener("focusin", onFocus);
      return () => {
        trigger.kill();
        element.removeEventListener("focusin", onFocus);
        gsap.set(element, { clearProps: "transform" });
      };
    },
    { dependencies: [sticky, hideOnScroll], revertOnUpdate: true },
  );

  return (
    // The wrapper reserves the header's full height so content never shifts
    // when the header becomes compact.
    <div className="relative h-[var(--header-height)]">
      <a
        href="#main"
        className="sr-only z-[60] rounded-sm bg-elevated px-3 py-2 text-small text-fg shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header
        ref={header}
        data-scrolled="false"
        data-hidden="false"
        className={cn("group/header inset-x-0 top-0 z-50", sticky ? "fixed" : "absolute")}
      >
        {/* Background layer: transparent at the top, solid with a hairline once scrolled. */}
        <div
          aria-hidden
          className="absolute inset-0 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-300 group-data-[scrolled=true]/header:border-line group-data-[scrolled=true]/header:bg-canvas/88 group-data-[scrolled=true]/header:shadow-[0_1px_12px_var(--color-shadow)] group-data-[scrolled=true]/header:backdrop-blur-md"
        />
        <div className="header-intro container-page relative grid h-[var(--header-height)] grid-cols-[1fr_auto] items-center gap-6 transition-[height] duration-300 ease-out group-data-[scrolled=true]/header:h-[var(--header-height-compact)] lg:grid-cols-[1fr_auto_1fr]">
          <BrandMark brand={brand} showTitle className="justify-self-start" />

          {items.length > 0 && (
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {items.map((item) => {
                  const current = isActivePath(item.url, pathname);
                  return (
                    <li key={item.id}>
                      <SmartLink
                        href={item.url}
                        newTab={item.newTab}
                        current={current}
                        className={cn(
                          "relative py-2 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors",
                          "after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:transition-transform after:duration-300 after:ease-out",
                          current
                            ? "text-fg after:scale-x-100 after:bg-accent"
                            : "text-fg-secondary after:scale-x-0 after:bg-fg-muted hover:text-fg hover:after:scale-x-100",
                        )}
                      >
                        {item.label}
                      </SmartLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <div className="flex items-center justify-self-end gap-1 sm:gap-2">
            <ThemeSwitch />
            {cta && (
              <SmartLink
                href={cta.url}
                newTab={cta.newTab}
                className="group/cta ml-2 hidden h-10 items-center gap-1.5 rounded-sm bg-button-primary px-4 text-small font-medium text-button-primary-fg transition-colors hover:bg-button-primary-hover md:inline-flex"
              >
                {cta.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                />
              </SmartLink>
            )}
            {(items.length > 0 || cta) && (
              <MobileMenu
                brand={brand}
                items={items}
                cta={cta}
                pathname={pathname}
                open={menuOpen}
                onOpenChange={setMenuOpen}
              />
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
