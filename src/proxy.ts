import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

/**
 * Optimistic auth check for the admin area: redirects based on the session
 * cookie only (no database access). Real authorization happens in the Data
 * Access Layer (src/lib/auth/dal.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === routes.admin.login;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session && !isLogin) {
    const url = new URL(routes.admin.login, request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // The login page itself redirects signed-in admins after confirming the
  // account still exists, which avoids a redirect loop on stale cookies.
  if (session && pathname === routes.admin.root) {
    return NextResponse.redirect(new URL(routes.admin.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
