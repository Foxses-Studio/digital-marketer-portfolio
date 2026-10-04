"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/config/routes";
import { runAction } from "@/lib/actions";
import { authorize } from "@/lib/auth/dal";
import { deleteMedia as deleteMediaRecord, updateMediaAlt as updateAlt } from "@/lib/media/service";
import type { ActionResult } from "@/types/actions";
import { deleteMediaSchema, updateMediaAltSchema } from "@/validation/media";
import { parseInput } from "@/validation/utils";

/** Uploads go through POST /api/admin/media (multipart); edits through here. */

export async function updateMediaAlt(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("media:manage");
    const { id, alt } = parseInput(updateMediaAltSchema, input);
    await updateAlt(id, alt);
    revalidatePath(routes.admin.media);
    return { ok: true, data: undefined, message: "Alt text saved." };
  });
}

export async function deleteMedia(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await authorize("media:manage");
    const { id } = parseInput(deleteMediaSchema, input);
    await deleteMediaRecord(id);
    revalidatePath(routes.admin.media);
    return { ok: true, data: undefined, message: "File deleted." };
  });
}
