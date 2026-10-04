"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { db, schema } from "@/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { actionError, type ActionResult } from "@/types/actions";
import { loginSchema } from "@/validation/auth";
import { fieldErrors } from "@/validation/utils";

/** Only allow redirects back into the admin area. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith(`${routes.admin.root}/`) && !next.startsWith("//")
    ? next
    : routes.admin.dashboard;
}

export async function login(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return actionError("Check the highlighted fields.", fieldErrors(parsed.error));
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, parsed.data.email))
    .limit(1);

  const valid =
    user && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!valid) return actionError("Incorrect email or password.");

  await db
    .update(schema.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(schema.users.id, user.id));
  await createSession(user.id);

  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect(routes.admin.login);
}
