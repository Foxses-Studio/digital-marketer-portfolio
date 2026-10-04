"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { collection } from "@/db";
import { createFirstSuperAdmin } from "@/lib/admins/bootstrap";
import { runAction } from "@/lib/actions";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteCurrentSession } from "@/lib/auth/session";
import { AuthenticationError, RateLimitError } from "@/lib/errors";
import { isRateLimited, recordHit, resetBuckets } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import type { ActionResult } from "@/types/actions";
import { loginSchema, setupSchema } from "@/validation/auth";
import { formDataToObject, parseInput } from "@/validation/utils";

const INVALID_CREDENTIALS = "Incorrect email or password.";

/** Only allow redirects back into the admin area. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith(`${routes.admin.root}/`) &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    next !== routes.admin.login
    ? next
    : routes.admin.dashboard;
}

// Compared against when the email is unknown, so a missing account takes
// as long to reject as a wrong password (no timing-based email probing).
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("dummy-password-0"));

export async function login(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const result = await runAction(async () => {
    const { email, password } = parseInput(loginSchema, formDataToObject(formData));

    const ip = await getClientIp();
    const buckets = [
      { key: `login:account:${ip}|${email}`, limit: 5, windowSeconds: 15 * 60 },
      { key: `login:ip:${ip}`, limit: 30, windowSeconds: 15 * 60 },
    ];
    if (await isRateLimited(buckets)) throw new RateLimitError();

    const users = await collection("users");
    const user = await users.findOne({ email });
    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

    if (!user || !valid) {
      await recordHit(buckets);
      throw new AuthenticationError(INVALID_CREDENTIALS);
    }
    // Only revealed after a correct password, so it doesn't leak whether
    // an email is registered.
    if (user.status !== "ACTIVE") {
      throw new AuthenticationError(
        "This account has been deactivated. Contact a Super Admin.",
      );
    }

    await resetBuckets([buckets[0].key]);
    await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    await createSession(user._id);
    return { ok: true, data: undefined } satisfies ActionResult;
  });

  if (result.ok) redirect(safeNext(formData.get("next")));
  return result;
}

/**
 * First-install only: creates the first Super Admin and signs them in.
 * Rejected by the server as soon as any account exists.
 */
export async function setupSuperAdmin(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const result = await runAction(async () => {
    // Role is deliberately not read from the form; it is always SUPER_ADMIN.
    const input = parseInput(setupSchema, formDataToObject(formData));
    const user = await createFirstSuperAdmin(input);
    await createSession(user._id);
    return { ok: true, data: undefined } satisfies ActionResult;
  });

  // The dashboard shows the confirmation (see components/admin/notice-alert).
  if (result.ok) redirect(`${routes.admin.dashboard}?notice=setup-complete`);
  return result;
}

export async function logout() {
  await deleteCurrentSession();
  redirect(routes.admin.login);
}
