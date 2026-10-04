import type { Metadata } from "next";
import { AdminsManager } from "@/components/admin/admins/admins-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listAdmins } from "@/lib/admins/service";
import { requirePagePermission } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Administrators" };

export default async function AdminsPage() {
  const admin = await requirePagePermission("admins:manage");
  const admins = await listAdmins();
  return (
    <>
      <PageHeader title="Administrators" description="People who can sign in to this admin panel." />
      <AdminsManager admins={admins} currentAdminId={admin.id} currentRole={admin.role} />
    </>
  );
}
