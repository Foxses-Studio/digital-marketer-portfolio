import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import type { CurrentAdmin } from "@/lib/auth/dal";
import { ROLE_LABELS } from "@/lib/permissions";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Signed-in account summary with sign-out. */
export function UserMenu({ admin }: { admin: CurrentAdmin }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-subtle text-[0.75rem] font-semibold text-accent"
      >
        {initials(admin.name)}
      </span>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="truncate text-small font-medium text-fg">{admin.name}</p>
        <p className="truncate text-[0.75rem] text-fg-muted">{ROLE_LABELS[admin.role]}</p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="grid size-8 place-items-center rounded-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
