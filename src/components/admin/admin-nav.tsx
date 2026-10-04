"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/config/admin-nav";
import { hasPermission, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils/cn";

/** Sidebar navigation, filtered by role (UI only; pages enforce access). */
export function AdminNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const allHrefs = adminNav.flatMap((g) => g.items.map((i) => i.href));
  // Most specific match wins, so /admin/settings/admins doesn't also
  // highlight /admin/settings.
  const active = allHrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav aria-label="Admin" className="space-y-6">
      {adminNav.map((group) => {
        const items = group.items.filter((item) => hasPermission(role, item.permission));
        if (items.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="mb-2 px-3 text-label text-fg-muted">{group.label}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const current = href === active;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center gap-3 rounded-sm px-3 text-small transition-colors",
                        current
                          ? "bg-hover font-medium text-fg"
                          : "text-fg-secondary hover:bg-hover hover:text-fg",
                      )}
                    >
                      <Icon className={cn("size-4", current ? "text-accent" : "text-fg-muted")} aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
