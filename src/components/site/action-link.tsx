import { ArrowUpRight } from "lucide-react";
import { SmartLink } from "@/sections/header/smart-link";
import { cn } from "@/lib/utils/cn";

type Cta = { enabled: boolean; label: string; url: string };

/** Solid button with the double-arrow hover used across the site. */
export function ButtonLink({
  cta,
  tone = "default",
  className,
}: {
  cta: Cta;
  tone?: "default" | "accent" | "feature";
  className?: string;
}) {
  if (!cta.enabled || !cta.label || !cta.url) return null;
  const tones = {
    default: "bg-button-primary text-button-primary-fg hover:bg-button-primary-hover",
    accent: "bg-accent text-accent-contrast hover:bg-accent-hover",
    feature: "bg-feature-fg text-feature hover:bg-feature-fg/85",
  };
  return (
    <SmartLink
      href={cta.url}
      newTab={false}
      className={cn(
        "group/button inline-flex h-13 items-center gap-2.5 rounded-sm pr-5 pl-6 text-[0.9375rem] font-medium transition-[background-color,box-shadow] duration-300 hover:shadow-md",
        tones[tone],
        className,
      )}
    >
      <span data-magnetic-inner className="inline-flex items-center gap-2.5">
        {cta.label}
        <span aria-hidden className="relative grid size-5 place-items-center overflow-hidden">
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/button:translate-x-5 group-hover/button:-translate-y-5" />
          <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/button:translate-x-0 group-hover/button:translate-y-0" />
        </span>
      </span>
    </SmartLink>
  );
}

/** Underlined text link with an arrow. */
export function TextLink({
  cta,
  tone = "default",
  className,
}: {
  cta: Cta;
  tone?: "default" | "feature";
  className?: string;
}) {
  if (!cta.enabled || !cta.label || !cta.url) return null;
  return (
    <SmartLink
      href={cta.url}
      newTab={false}
      className={cn(
        "group/text relative inline-flex h-11 items-center gap-2 text-[0.9375rem] font-medium",
        tone === "feature" ? "text-feature-fg" : "text-fg",
        className,
      )}
    >
      <span className="relative">
        {cta.label}
        <span aria-hidden className={cn("absolute inset-x-0 -bottom-1 h-px", tone === "feature" ? "bg-feature-fg/25" : "bg-fg/20")} />
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/text:scale-x-100"
        />
      </span>
      <ArrowUpRight
        aria-hidden
        className={cn(
          "size-4 transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover/text:translate-x-0.5 group-hover/text:-translate-y-0.5 group-hover/text:text-accent",
          tone === "feature" ? "text-feature-muted" : "text-fg-muted",
        )}
      />
    </SmartLink>
  );
}
