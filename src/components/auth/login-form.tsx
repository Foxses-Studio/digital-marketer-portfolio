"use client";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { PasswordField, TextField } from "@/components/ui/field";
import { useActionForm } from "@/hooks/use-action-form";
import { loginSchema } from "@/validation/auth";

export function LoginForm({ next }: { next?: string }) {
  const { onSubmit, pending, errors } = useActionForm({ action: login, schema: loginSchema });

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        autoFocus
        required
        errors={errors.email}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        required
        errors={errors.password}
      />
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
