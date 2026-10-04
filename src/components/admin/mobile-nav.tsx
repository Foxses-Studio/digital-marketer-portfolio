"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Role } from "@/lib/permissions";
import { AdminNav } from "./admin-nav";

/**
 * Drawer navigation for small screens, built on <dialog>: focus is trapped
 * while open, Escape closes it, and the page behind is inert.
 */
export function MobileNav({ role, siteName }: { role: Role; siteName: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="grid size-9 place-items-center rounded-sm text-fg-secondary hover:bg-hover hover:text-fg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <dialog
        ref={dialog}
        aria-label="Navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-0 h-dvh max-h-none w-[min(18rem,85vw)] max-w-none bg-surface p-0 text-fg backdrop:bg-black/40 open:flex open:flex-col lg:hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <span className="text-small font-semibold">{siteName}</span>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="grid size-9 place-items-center rounded-sm text-fg-secondary hover:bg-hover hover:text-fg"
            aria-label="Close navigation"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <AdminNav role={role} onNavigate={() => dialog.current?.close()} />
        </div>
      </dialog>
    </>
  );
}
