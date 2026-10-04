import "server-only";
import { NextResponse } from "next/server";
import { AppError, GENERIC_ERROR_MESSAGE, ValidationError } from "@/lib/errors";

/** JSON error response for Route Handlers, mirroring runAction(). */
export function apiError(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { ok: false, error: error.message, fieldErrors: error.fieldErrors },
      { status: error.status },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }
  console.error("[api] unexpected error", error);
  return NextResponse.json({ ok: false, error: GENERIC_ERROR_MESSAGE }, { status: 500 });
}
