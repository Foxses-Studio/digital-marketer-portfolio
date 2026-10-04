import type { LucideIcon } from "lucide-react";
import Link from "next/link";

/**
 * A count from the database. Never pass invented numbers: when the count
 * is zero, the card says so plainly.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  emptyText,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  emptyText: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-line-strong"
    >
      <div className="flex items-center justify-between">
        <span className="text-small text-fg-secondary">{label}</span>
        <Icon className="size-4 text-fg-muted transition-colors group-hover:text-fg" aria-hidden />
      </div>
      <p className="mt-3 text-[2rem] leading-none font-semibold tracking-tight text-fg tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-2 text-small text-fg-muted">
        {value === 0 ? emptyText : `${value === 1 ? "1 item" : `${value.toLocaleString("en-US")} items`}`}
      </p>
    </Link>
  );
}
