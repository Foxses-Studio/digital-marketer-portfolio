import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme";

/** Centered card layout for the sign-in and first-install screens. */
export function AuthLayout({
  siteName,
  title,
  description,
  children,
}: {
  siteName: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="text-small font-semibold tracking-tight text-fg">{siteName}</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pt-[8vh] pb-16 sm:items-center sm:pt-0">
        <div className="w-full max-w-[25rem]">
          <div className="mb-8">
            <p className="text-label text-fg-muted">Admin</p>
            <h1 className="mt-3 text-title text-fg">{title}</h1>
            <p className="mt-2 text-body text-fg-secondary">{description}</p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-6 shadow-sm sm:p-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
