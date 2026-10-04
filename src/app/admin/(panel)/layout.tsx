import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/dal";
import { getSettings } from "@/lib/cms/settings";

/**
 * Authenticated admin frame. The session check streams in behind Suspense
 * (it reads the request). Each page still authorizes itself; this layout
 * only provides the shell.
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const [admin, { siteName }] = await Promise.all([requireAdmin(), getSettings("site")]);
  return (
    <AdminShell admin={admin} siteName={siteName}>
      {children}
    </AdminShell>
  );
}

function ShellFallback() {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[16rem_1fr]" aria-busy="true">
      <div className="hidden border-r border-line bg-surface lg:block" />
      <div className="h-16 border-b border-line bg-surface" />
    </div>
  );
}
