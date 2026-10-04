"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import { createAdmin, setAdminStatus, updateAdminRole } from "@/actions/admins";
import { Button } from "@/components/ui/button";
import { PasswordField, SelectField, TextField } from "@/components/ui/field";
import { useActionForm } from "@/hooks/use-action-form";
import type { AdminListItem } from "@/lib/admins/service";
import { confirmAction, reportResult } from "@/lib/feedback/alerts";
import { canAssignRole, ROLE_LABELS, ROLES, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils/cn";
import { PASSWORD_RULES } from "@/validation/auth";
import { createAdminSchema } from "@/validation/admins";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function AdminsManager({
  admins,
  currentAdminId,
  currentRole,
}: {
  admins: AdminListItem[];
  currentAdminId: string;
  currentRole: Role;
}) {
  const [showForm, setShowForm] = useState(false);
  const assignable = ROLES.filter((role) => canAssignRole(currentRole, role));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="size-4" aria-hidden />
            Add administrator
          </Button>
        )}
      </div>
      {showForm && <CreateAdminForm roles={assignable} onDone={() => setShowForm(false)} />}

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-left text-small">
          <thead className="border-b border-line text-fg-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Role</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Last sign-in</th>
              <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {admins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                isSelf={admin.id === currentAdminId}
                manageable={canAssignRole(currentRole, admin.role)}
                roles={assignable}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminRow({
  admin,
  isSelf,
  manageable,
  roles,
}: {
  admin: AdminListItem;
  isSelf: boolean;
  manageable: boolean;
  roles: readonly Role[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const editable = manageable && !isSelf;
  const active = admin.status === "ACTIVE";

  async function changeRole(role: Role) {
    if (role === admin.role) return;
    const confirmed = await confirmAction({
      title: `Make ${admin.name} ${ROLE_LABELS[role]}?`,
      text:
        role === "SUPER_ADMIN"
          ? "Super Admins can manage other administrators."
          : "They will no longer be able to manage administrators.",
      confirmText: "Change role",
    });
    if (!confirmed) return router.refresh();
    startTransition(async () => {
      await reportResult(await updateAdminRole({ id: admin.id, role }));
      router.refresh();
    });
  }

  async function toggleStatus() {
    const confirmed = await confirmAction(
      active
        ? {
            title: `Deactivate ${admin.name}?`,
            text: "They will be signed out and can't sign in until reactivated.",
            confirmText: "Deactivate",
            destructive: true,
          }
        : { title: `Reactivate ${admin.name}?`, text: "They will be able to sign in again.", confirmText: "Reactivate" },
    );
    if (!confirmed) return;
    startTransition(async () => {
      await reportResult(await setAdminStatus({ id: admin.id, status: active ? "INACTIVE" : "ACTIVE" }));
      router.refresh();
    });
  }

  return (
    <tr className={cn(pending && "opacity-60")} data-admin-email={admin.email}>
      <td className="px-4 py-3">
        <p className="font-medium text-fg">
          {admin.name}
          {isSelf && <span className="ml-2 text-fg-muted">(you)</span>}
        </p>
        <p className="text-fg-muted">{admin.email}</p>
      </td>
      <td className="px-4 py-3">
        {editable ? (
          <select
            aria-label={`Role for ${admin.name}`}
            defaultValue={admin.role}
            disabled={pending}
            onChange={(event) => void changeRole(event.target.value as Role)}
            className="h-8 rounded-sm border border-line-strong bg-surface px-2 text-small text-fg"
          >
            {roles.map((role) => (
              <option key={role} value={role}>{ROLE_LABELS[role]}</option>
            ))}
          </select>
        ) : (
          <span className="text-fg">{ROLE_LABELS[admin.role]}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex items-center gap-1.5", active ? "text-success" : "text-fg-muted")}>
          <span aria-hidden className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-fg-muted")} />
          {active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-fg-secondary">
        {admin.lastLoginAt ? dateFormat.format(new Date(admin.lastLoginAt)) : "Never"}
      </td>
      <td className="px-4 py-3 text-right">
        {editable && (
          <Button variant={active ? "ghost" : "secondary"} size="sm" disabled={pending} onClick={() => void toggleStatus()}>
            {active ? "Deactivate" : "Reactivate"}
          </Button>
        )}
      </td>
    </tr>
  );
}

function CreateAdminForm({ roles, onDone }: { roles: readonly Role[]; onDone: () => void }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const onSuccess = useCallback(() => {
    form.current?.reset();
    router.refresh();
    onDone();
  }, [router, onDone]);
  const { onSubmit, pending, errors } = useActionForm({
    action: createAdmin,
    schema: createAdminSchema,
    onSuccess,
  });

  return (
    <form
      ref={form}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-line bg-surface p-5 sm:p-6"
      aria-labelledby="create-admin-title"
    >
      <h2 id="create-admin-title" className="text-body font-semibold text-fg">New administrator</h2>
      <p className="mt-1 text-small text-fg-secondary">
        Share the password with them securely. They can sign in right away.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" name="name" autoComplete="off" required errors={errors.name} />
        <TextField label="Email" name="email" type="email" autoComplete="off" required errors={errors.email} />
        <SelectField
          label="Role"
          name="role"
          defaultValue="ADMIN"
          options={roles.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
          errors={errors.role}
        />
        <PasswordField
          label="Temporary password"
          name="password"
          autoComplete="new-password"
          required
          hint={PASSWORD_RULES.join(" · ")}
          errors={errors.password}
        />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone} disabled={pending}>Cancel</Button>
        <Button type="submit" loading={pending}>Create administrator</Button>
      </div>
    </form>
  );
}
