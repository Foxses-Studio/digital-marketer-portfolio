"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { collection } from "@/db";
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

  const users = await collection("users");
  const user = await users.findOne({ email: parsed.data.email });

  const valid =
    user && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!valid) return actionError("Incorrect email or password.");

  await users.updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: new Date() } },
  );
  await createSession(user._id.toHexString());

  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect(routes.admin.login);
}
