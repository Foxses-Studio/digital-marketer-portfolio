import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { SESSION_COOKIE, SESSION_TOKEN_PATTERN } from "@/lib/auth/constants";

/**
 * Optimistic gate for the admin area: without a well-formed session cookie,
 * admin pages redirect to the login page and admin APIs return 401. It
 * does no database lookups, so it is not authorization: every page, action
 * and route verifies the session itself (src/lib/auth/dal.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = token !== undefined && SESSION_TOKEN_PATTERN.test(token);

  if (pathname.startsWith("/api/admin")) {
    return hasSession
      ? NextResponse.next()
      : NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  if (pathname === routes.admin.login) return NextResponse.next();

  if (!hasSession) {
    const url = new URL(routes.admin.login, request.url);
    if (pathname !== routes.admin.root) url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname === routes.admin.root) {
    return NextResponse.redirect(new URL(routes.admin.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
