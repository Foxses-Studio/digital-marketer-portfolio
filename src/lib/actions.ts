import "server-only";
import { unstable_rethrow } from "next/navigation";
import { AppError, GENERIC_ERROR_MESSAGE, ValidationError } from "@/lib/errors";
import type { ActionResult } from "@/types/actions";

/**
 * Wraps a Server Action body so every action reports errors the same way:
 * - redirect()/notFound() pass through untouched,
 * - expected AppErrors become `{ ok: false, error, fieldErrors? }`,
 * - anything else is logged on the server and replaced with a generic
 *   message, so stack traces and database details never reach the client.
 */
export async function runAction<T>(
  body: () => Promise<ActionResult<T> | T>,
): Promise<ActionResult<T>> {
  try {
    const result = await body();
    if (isActionResult<T>(result)) return result;
    return { ok: true, data: result };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message, fieldErrors: error.fieldErrors };
    }
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error("[action] unexpected error", error);
    return { ok: false, error: GENERIC_ERROR_MESSAGE };
  }
}

function isActionResult<T>(value: unknown): value is ActionResult<T> {
  return typeof value === "object" && value !== null && "ok" in value &&
    typeof (value as { ok: unknown }).ok === "boolean";
}
