import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      <Icon className="size-6 text-fg-muted" aria-hidden />
      <p className="mt-4 text-body font-medium text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-small text-fg-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
