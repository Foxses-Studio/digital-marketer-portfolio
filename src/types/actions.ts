/**
 * Standard return shape for Server Actions, so forms can show field errors
 * and the UI can trigger SweetAlert2 feedback consistently.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function actionSuccess<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function actionError(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}
