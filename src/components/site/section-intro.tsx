import { cn } from "@/lib/utils/cn";
import { HighlightText } from "./highlight-text";

/**
 * Standard section opening: index + label, a display heading revealed line
 * by line ([data-split]) and an optional description ([data-fade]).
 */
export function SectionIntro({
  index,
  label,
  heading,
  highlight,
  description,
  id,
  tone = "default",
  className,
  aside,
}: {
  index?: number;
  label?: string;
  heading?: string;
  highlight?: string;
  description?: string;
  id: string;
  tone?: "default" | "feature";
  className?: string;
  aside?: React.ReactNode;
}) {
  const muted = tone === "feature" ? "text-feature-muted" : "text-fg-muted";
  return (
    <header className={cn("flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        {(index || label) && (
          <p data-fade className={cn("flex items-center gap-3 text-label", muted)}>
            {index && <span className="tabular-nums">{String(index).padStart(2, "0")}</span>}
            {index && label && <span aria-hidden className={cn("h-px w-8", tone === "feature" ? "bg-feature-fg/25" : "bg-line-strong")} />}
            {label && <span>{label}</span>}
          </p>
        )}
        {heading && (
          <h2 id={id} data-split className="mt-5 text-h2 max-w-[20ch]">
            <HighlightText text={heading} highlight={highlight} />
          </h2>
        )}
        {description && (
          <p data-fade className={cn("mt-5 max-w-[38rem] text-body-lg", tone === "feature" ? "text-feature-muted" : "text-fg-secondary")}>
            {description}
          </p>
        )}
      </div>
      {aside && <div data-fade className="shrink-0">{aside}</div>}
    </header>
  );
}
