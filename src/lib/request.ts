import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort client IP. Only trustworthy when the app runs behind a proxy
 * that sets these headers (Vercel, a load balancer, nginx). Used for rate
 * limiting, never for authorization.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}
