"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/config/routes";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import {
  createAdmin as createAdminRecord,
  setAdminStatus as setAdminStatusRecord,
  updateAdminRole as updateAdminRoleRecord,
} from "@/lib/admins/service";
import type { ActionResult } from "@/types/actions";
import {
  createAdminSchema,
  setAdminStatusSchema,
  updateAdminRoleSchema,
} from "@/validation/admins";
import { formDataToObject, parseInput } from "@/validation/utils";

/** Every action here requires `admins:manage` (Super Admin only). */

export async function createAdmin(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await authorize("admins:manage");
    const input = parseInput(createAdminSchema, formDataToObject(formData));
    await createAdminRecord(actor, input);
    revalidatePath(routes.admin.admins);
    return { ok: true, data: undefined, message: "Administrator created." };
  });
}

export async function updateAdminRole(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await authorize("admins:manage");
    const { id, role } = parseInput(updateAdminRoleSchema, input);
    await updateAdminRoleRecord(actor, id, role);
    revalidatePath(routes.admin.admins);
    return { ok: true, data: undefined, message: "Role updated." };
  });
}

export async function setAdminStatus(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await authorize("admins:manage");
    const { id, status } = parseInput(setAdminStatusSchema, input);
    await setAdminStatusRecord(actor, id, status);
    revalidatePath(routes.admin.admins);
    return {
      ok: true,
      data: undefined,
      message: status === "ACTIVE" ? "Administrator reactivated." : "Administrator deactivated.",
    };
  });
}
