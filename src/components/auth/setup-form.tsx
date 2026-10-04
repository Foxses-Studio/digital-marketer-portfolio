"use client";

import { setupSuperAdmin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { PasswordField, TextField } from "@/components/ui/field";
import { useActionForm } from "@/hooks/use-action-form";
import { PASSWORD_RULES, setupSchema } from "@/validation/auth";

export function SetupForm() {
  // On success the action signs the owner in and redirects to the dashboard.
  const { onSubmit, pending, errors } = useActionForm({
    action: setupSuperAdmin,
    schema: setupSchema,
  });

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5">
      <TextField label="Full name" name="name" autoComplete="name" autoFocus required errors={errors.name} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        errors={errors.email}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        hint={PASSWORD_RULES.join(" · ")}
        errors={errors.password}
      />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        errors={errors.confirmPassword}
      />
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Create Super Admin
      </Button>
    </form>
  );
}
