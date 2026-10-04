import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/admin/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Access denied" };

export default async function ForbiddenPage() {
  await requireAdmin();
  return (
    <EmptyState
      icon={ShieldCheck}
      title="You don't have access to this page"
      description="Ask a Super Admin if you need access."
      action={
        <Link href={routes.admin.dashboard} className={buttonClasses({ variant: "secondary" })}>
          Back to dashboard
        </Link>
      }
    />
  );
}
