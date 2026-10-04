import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme";
import { routes } from "@/config/routes";
import type { CurrentAdmin } from "@/lib/auth/dal";
import { AdminNav } from "./admin-nav";
import { MobileNav } from "./mobile-nav";
import { NoticeAlert } from "./notice-alert";
import { UserMenu } from "./user-menu";

/** Sidebar + topbar + content frame for every authenticated admin page. */
export function AdminShell({
  admin,
  siteName,
  children,
}: {
  admin: CurrentAdmin;
  siteName: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[16rem_1fr]">
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-sm bg-elevated px-3 py-2 text-small focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-6">
          <Link href={routes.admin.dashboard} className="truncate text-small font-semibold text-fg">
            {siteName}
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <AdminNav role={admin.role} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-sm sm:px-6">
          <MobileNav role={admin.role} siteName={siteName} />
          <span className="truncate text-small font-semibold text-fg lg:hidden">{siteName}</span>
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <Link
              href={routes.home}
              target="_blank"
              className="hidden text-small text-fg-secondary hover:text-fg sm:inline"
            >
              View site
            </Link>
            <ThemeToggle />
            <UserMenu admin={admin} />
          </div>
        </header>
        <NoticeAlert />
        <main id="admin-main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
