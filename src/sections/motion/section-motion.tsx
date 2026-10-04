"use client";

import { useRef, type ReactNode } from "react";
import { useSectionMotion } from "@/animations/use-section-motion";
import { cn } from "@/lib/utils/cn";
import { setups, type MotionVariant } from "./setups";

/**
 * Client shell for a server-rendered homepage section. Renders the
 * <section> element and attaches the intro reveal plus the section's own
 * choreography (see ./setups). Content stays server-rendered.
 */
export function SectionMotion({
  variant,
  id,
  labelledBy,
  className,
  children,
  tone,
}: {
  variant: MotionVariant;
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
  tone?: "feature";
}) {
  const ref = useRef<HTMLElement>(null);
  useSectionMotion(ref, (scope) => setups[variant]?.(scope));
  return (
    <section
      ref={ref}
      id={id}
      data-section={variant}
      data-tone={tone}
      aria-labelledby={labelledBy}
      className={cn("relative", className)}
    >
      {children}
    </section>
  );
}
