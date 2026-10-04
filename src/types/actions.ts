/**
 * Standard return shape for Server Actions (see runAction in
 * src/lib/actions.ts), so forms can show field errors and the UI can show
 * SweetAlert2 feedback consistently.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
